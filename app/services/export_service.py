"""
Export Service
Business logic for exporting schedules to PNG and ICS formats
"""
from datetime import datetime, timedelta
from typing import Optional
from icalendar import Calendar, Event
import uuid

from app.models.horario import HorarioCombination
from app.models.clase import DayOfWeek


class ExportService:
    """
    Service for exporting schedules to various formats
    """
    
    # Day mapping for ICS (Python weekday: 0=Monday)
    DAY_TO_WEEKDAY = {
        'L': 0,  # Monday
        'M': 1,  # Tuesday
        'W': 2,  # Wednesday
        'J': 3,  # Thursday
        'V': 4,  # Friday
        'S': 5,  # Saturday
        'D': 6   # Sunday
    }
    
    @staticmethod
    def generate_ics(
        combination: HorarioCombination,
        semester_start: str,
        semester_end: str,
        course_names: dict[str, str] = None
    ) -> str:
        """
        Generate ICS calendar file content for a schedule
        
        Args:
            combination: Schedule combination to export
            semester_start: Semester start date (YYYY-MM-DD)
            semester_end: Semester end date (YYYY-MM-DD)
            course_names: Optional dict mapping course codes to names
            
        Returns:
            ICS file content as string
        """
        if course_names is None:
            course_names = {}
        
        cal = Calendar()
        cal.add('prodid', '-//Uni-App//Schedule Export//ES')
        cal.add('version', '2.0')
        cal.add('calscale', 'GREGORIAN')
        cal.add('method', 'PUBLISH')
        cal.add('x-wr-calname', 'Mi Horario Universitario')
        
        start_date = datetime.strptime(semester_start, '%Y-%m-%d')
        end_date = datetime.strptime(semester_end, '%Y-%m-%d')
        
        for clase in combination.clases:
            course_name = course_names.get(clase.materia_code, clase.materia_code)
            
            for block in clase.schedule:
                # Find the first occurrence of this day
                target_weekday = ExportService.DAY_TO_WEEKDAY.get(block.day.value, 0)
                
                # Calculate days until first occurrence
                days_ahead = target_weekday - start_date.weekday()
                if days_ahead < 0:
                    days_ahead += 7
                
                first_occurrence = start_date + timedelta(days=days_ahead)
                
                # Parse time
                start_hour, start_min = map(int, block.start.split(':'))
                end_hour, end_min = map(int, block.end.split(':'))
                
                # Create event
                event = Event()
                event.add('uid', f"{uuid.uuid4()}@uni-app")
                event.add('summary', f"{course_name} ({clase.class_code})")
                
                # Set event times
                event_start = first_occurrence.replace(hour=start_hour, minute=start_min)
                event_end = first_occurrence.replace(hour=end_hour, minute=end_min)
                
                event.add('dtstart', event_start)
                event.add('dtend', event_end)
                
                # Add location if available
                if clase.location:
                    event.add('location', clase.location)
                
                # Add description
                description_parts = [f"Materia: {course_name}"]
                description_parts.append(f"Sección: {clase.class_code}")
                if clase.professor:
                    description_parts.append(f"Profesor: {clase.professor}")
                event.add('description', '\n'.join(description_parts))
                
                # Add weekly recurrence until semester end
                event.add('rrule', {
                    'freq': 'weekly',
                    'until': end_date,
                    'byday': ExportService._get_rrule_day(block.day.value)
                })
                
                cal.add_component(event)
        
        return cal.to_ical().decode('utf-8')
    
    @staticmethod
    def _get_rrule_day(day_code: str) -> str:
        """Convert day code to iCal RRULE day format"""
        day_map = {
            'L': 'MO',
            'M': 'TU',
            'W': 'WE',
            'J': 'TH',
            'V': 'FR',
            'S': 'SA',
            'D': 'SU'
        }
        return day_map.get(day_code, 'MO')
    
    @staticmethod
    def get_schedule_html_for_export(
        combination: HorarioCombination,
        course_names: dict[str, str] = None,
        course_colors: dict[str, str] = None
    ) -> str:
        """
        Generate HTML representation of schedule for PNG export (client-side)
        
        Args:
            combination: Schedule combination
            course_names: Dict mapping course codes to names
            course_colors: Dict mapping course codes to colors
            
        Returns:
            HTML string for rendering
        """
        if course_names is None:
            course_names = {}
        if course_colors is None:
            course_colors = {}
        
        days = ['L', 'M', 'W', 'J', 'V', 'S']
        day_names = {
            'L': 'Lunes', 'M': 'Martes', 'W': 'Miércoles',
            'J': 'Jueves', 'V': 'Viernes', 'S': 'Sábado'
        }
        
        # Generate time slots
        times = [f"{h:02d}:00" for h in range(7, 21)]
        
        # Build grid data
        grid = {day: {} for day in days}
        
        for clase in combination.clases:
            color = course_colors.get(clase.materia_code, '#5091AF')
            name = course_names.get(clase.materia_code, clase.materia_code)
            
            for block in clase.schedule:
                day = block.day.value
                if day in grid:
                    start_hour = int(block.start.split(':')[0])
                    end_hour = int(block.end.split(':')[0])
                    duration = end_hour - start_hour
                    
                    grid[day][block.start] = {
                        'name': name,
                        'code': clase.class_code,
                        'professor': clase.professor or '',
                        'color': color,
                        'duration': duration,
                        'end': block.end
                    }
        
        # Build HTML
        html = f'''
        <div id="schedule-export" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; background: white;">
            <h2 style="text-align: center; color: #333; margin-bottom: 20px;">Mi Horario</h2>
            <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
                <thead>
                    <tr>
                        <th style="width: 60px; padding: 10px; background: #f5f5f5; border: 1px solid #ddd;"></th>
                        {''.join(f'<th style="padding: 10px; background: #f5f5f5; border: 1px solid #ddd; text-align: center;">{day_names[d]}</th>' for d in days)}
                    </tr>
                </thead>
                <tbody>
        '''
        
        for time in times:
            html += f'<tr>'
            html += f'<td style="padding: 8px; background: #f9f9f9; border: 1px solid #ddd; font-size: 12px; text-align: center;">{time}</td>'
            
            for day in days:
                cell_data = grid[day].get(time)
                if cell_data:
                    rowspan = cell_data['duration']
                    html += f'''
                        <td rowspan="{rowspan}" style="padding: 8px; background: {cell_data['color']}20; border: 1px solid {cell_data['color']}; vertical-align: top;">
                            <div style="font-weight: 600; color: {cell_data['color']}; font-size: 13px;">{cell_data['name']}</div>
                            <div style="font-size: 11px; color: #666;">{cell_data['code']}</div>
                            <div style="font-size: 10px; color: #888;">{time} - {cell_data['end']}</div>
                            {f'<div style="font-size: 10px; color: #888; margin-top: 2px;">{cell_data["professor"]}</div>' if cell_data['professor'] else ''}
                        </td>
                    '''
                else:
                    # Check if this cell is covered by a rowspan
                    is_covered = False
                    for check_time in times:
                        if check_time >= time:
                            break
                        check_data = grid[day].get(check_time)
                        if check_data:
                            check_hour = int(check_time.split(':')[0])
                            current_hour = int(time.split(':')[0])
                            if check_hour + check_data['duration'] > current_hour:
                                is_covered = True
                                break
                    
                    if not is_covered:
                        html += '<td style="padding: 8px; border: 1px solid #eee;"></td>'
            
            html += '</tr>'
        
        html += '''
                </tbody>
            </table>
            <div style="margin-top: 15px; text-align: center; color: #888; font-size: 12px;">
                Generado con Uni-App
            </div>
        </div>
        '''
        
        return html
    
    @staticmethod
    def validate_export_dates(semester_start: str, semester_end: str) -> dict:
        """
        Validate semester dates for ICS export
        
        Returns:
            Dict with 'valid' bool and 'error' string if invalid
        """
        try:
            start = datetime.strptime(semester_start, '%Y-%m-%d')
            end = datetime.strptime(semester_end, '%Y-%m-%d')
            
            if end <= start:
                return {'valid': False, 'error': 'End date must be after start date'}
            
            # Check reasonable semester length (2-6 months)
            days_diff = (end - start).days
            if days_diff < 60:
                return {'valid': False, 'error': 'Semester seems too short (less than 60 days)'}
            if days_diff > 200:
                return {'valid': False, 'error': 'Semester seems too long (more than 200 days)'}
            
            return {'valid': True}
        
        except ValueError as e:
            return {'valid': False, 'error': f'Invalid date format: {str(e)}'}
