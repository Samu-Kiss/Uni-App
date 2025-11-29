"""
GPA Service
Business logic for GPA calculations, grade simulation, and academic tracking
"""
from typing import Optional
from app.models.materia import Materia, MateriaStatus, Pensum
from app.models.configuracion import Calificacion, GradeHistory, Configuracion


class GPAService:
    """
    Service for GPA calculations including:
    - Semester GPA calculation
    - Cumulative GPA calculation
    - Grade simulation
    - Academic alerts
    """
    
    @staticmethod
    def calculate_course_grade(calificaciones: list[Calificacion]) -> Optional[float]:
        """
        Calculate final grade for a course based on individual evaluations
        
        Args:
            calificaciones: List of grade entries for the course
            
        Returns:
            Weighted average grade or None if no grades
        """
        if not calificaciones:
            return None
        
        total_weight = sum(c.porcentaje for c in calificaciones if not c.is_simulation)
        if total_weight == 0:
            return None
        
        weighted_sum = sum(c.nota * c.porcentaje for c in calificaciones if not c.is_simulation)
        return weighted_sum / total_weight
    
    @staticmethod
    def calculate_course_grade_with_simulation(
        calificaciones: list[Calificacion],
        include_simulation: bool = True
    ) -> dict:
        """
        Calculate course grade with optional simulation grades
        
        Args:
            calificaciones: List of grade entries
            include_simulation: Whether to include simulated grades
            
        Returns:
            Dict with actual grade, simulated grade, and percentage completed
        """
        real_grades = [c for c in calificaciones if not c.is_simulation]
        sim_grades = [c for c in calificaciones if c.is_simulation]
        
        # Calculate actual grade
        real_weight = sum(c.porcentaje for c in real_grades)
        real_grade = None
        if real_weight > 0:
            real_grade = sum(c.nota * c.porcentaje for c in real_grades) / real_weight
        
        # Calculate with simulation
        simulated_grade = None
        if include_simulation and (real_grades or sim_grades):
            all_grades = real_grades + sim_grades
            total_weight = sum(c.porcentaje for c in all_grades)
            if total_weight > 0:
                simulated_grade = sum(c.nota * c.porcentaje for c in all_grades) / total_weight
        
        return {
            'actual_grade': round(real_grade, 2) if real_grade else None,
            'simulated_grade': round(simulated_grade, 2) if simulated_grade else None,
            'percentage_completed': round(real_weight, 1),
            'percentage_remaining': round(100 - real_weight, 1)
        }
    
    @staticmethod
    def calculate_semester_gpa(
        semester: int,
        pensum: Pensum,
        config: Configuracion = None
    ) -> dict:
        """
        Calculate GPA for a specific semester
        
        Args:
            semester: Semester number
            pensum: Current pensum
            config: Configuration for passing grade threshold
            
        Returns:
            Dict with GPA, credits, and course details
        """
        if config is None:
            config = Configuracion()
        
        semester_courses = pensum.get_semester_materias(semester)
        graded_courses = [m for m in semester_courses if m.grade is not None]
        
        if not graded_courses:
            return {
                'gpa': None,
                'total_credits': sum(m.credits for m in semester_courses),
                'graded_credits': 0,
                'courses': [],
                'passed': 0,
                'failed': 0
            }
        
        total_points = 0
        total_credits = 0
        passed = 0
        failed = 0
        courses_detail = []
        
        for materia in graded_courses:
            points = materia.grade * materia.credits
            total_points += points
            total_credits += materia.credits
            
            is_passed = materia.grade >= config.passing_grade
            if is_passed:
                passed += 1
            else:
                failed += 1
            
            courses_detail.append({
                'code': materia.code,
                'name': materia.name,
                'credits': materia.credits,
                'grade': materia.grade,
                'passed': is_passed
            })
        
        gpa = total_points / total_credits if total_credits > 0 else None
        
        return {
            'gpa': round(gpa, 2) if gpa else None,
            'total_credits': sum(m.credits for m in semester_courses),
            'graded_credits': total_credits,
            'courses': courses_detail,
            'passed': passed,
            'failed': failed
        }
    
    @staticmethod
    def calculate_cumulative_gpa(
        pensum: Pensum,
        config: Configuracion = None
    ) -> dict:
        """
        Calculate cumulative GPA across all semesters
        
        Args:
            pensum: Current pensum
            config: Configuration
            
        Returns:
            Dict with cumulative GPA and breakdown by semester
        """
        if config is None:
            config = Configuracion()
        
        all_graded = [m for m in pensum.materias if m.grade is not None]
        
        if not all_graded:
            return {
                'cumulative_gpa': None,
                'total_credits_completed': 0,
                'total_credits_pensum': pensum.total_credits,
                'progress_percentage': 0,
                'semesters': {},
                'total_passed': 0,
                'total_failed': 0
            }
        
        total_points = 0
        total_credits = 0
        total_passed = 0
        total_failed = 0
        semesters = {}
        
        max_semester = pensum.get_max_semester()
        
        for sem in range(1, max_semester + 1):
            sem_result = GPAService.calculate_semester_gpa(sem, pensum, config)
            semesters[sem] = sem_result
            
            if sem_result['gpa'] is not None:
                total_passed += sem_result['passed']
                total_failed += sem_result['failed']
        
        for materia in all_graded:
            total_points += materia.grade * materia.credits
            total_credits += materia.credits
        
        cumulative_gpa = total_points / total_credits if total_credits > 0 else None
        progress = (total_credits / pensum.total_credits * 100) if pensum.total_credits > 0 else 0
        
        return {
            'cumulative_gpa': round(cumulative_gpa, 2) if cumulative_gpa else None,
            'total_credits_completed': total_credits,
            'total_credits_pensum': pensum.total_credits,
            'progress_percentage': round(progress, 1),
            'semesters': semesters,
            'total_passed': total_passed,
            'total_failed': total_failed
        }
    
    @staticmethod
    def simulate_grades(
        pensum: Pensum,
        simulated_grades: dict[str, float],
        config: Configuracion = None
    ) -> dict:
        """
        Simulate future grades and calculate impact on GPA
        
        Args:
            pensum: Current pensum
            simulated_grades: Dict of course_code -> simulated_grade
            config: Configuration
            
        Returns:
            Dict with current vs simulated GPA comparison
        """
        if config is None:
            config = Configuracion()
        
        # Calculate current cumulative GPA
        current_result = GPAService.calculate_cumulative_gpa(pensum, config)
        current_gpa = current_result['cumulative_gpa'] or 0
        current_credits = current_result['total_credits_completed']
        
        # Calculate with simulated grades
        simulated_points = current_gpa * current_credits if current_credits > 0 else 0
        simulated_credits = current_credits
        
        simulated_courses = []
        
        for code, grade in simulated_grades.items():
            materia = pensum.get_materia(code)
            if materia and materia.grade is None:  # Only simulate ungraded courses
                simulated_points += grade * materia.credits
                simulated_credits += materia.credits
                
                simulated_courses.append({
                    'code': materia.code,
                    'name': materia.name,
                    'credits': materia.credits,
                    'simulated_grade': grade,
                    'would_pass': grade >= config.passing_grade
                })
        
        new_gpa = simulated_points / simulated_credits if simulated_credits > 0 else None
        gpa_change = (new_gpa - current_gpa) if new_gpa and current_gpa else None
        
        return {
            'current_gpa': current_gpa,
            'simulated_gpa': round(new_gpa, 2) if new_gpa else None,
            'gpa_change': round(gpa_change, 2) if gpa_change else None,
            'gpa_improved': gpa_change > 0 if gpa_change else None,
            'current_credits': current_credits,
            'simulated_credits': simulated_credits,
            'simulated_courses': simulated_courses
        }
    
    @staticmethod
    def get_needed_grade_for_target(
        pensum: Pensum,
        target_gpa: float,
        remaining_courses: list[str],
        config: Configuracion = None
    ) -> dict:
        """
        Calculate what average grade is needed in remaining courses to achieve target GPA
        
        Args:
            pensum: Current pensum
            target_gpa: Target cumulative GPA
            remaining_courses: List of course codes to consider
            config: Configuration
            
        Returns:
            Dict with needed average grade
        """
        if config is None:
            config = Configuracion()
        
        # Current state
        current_result = GPAService.calculate_cumulative_gpa(pensum, config)
        current_gpa = current_result['cumulative_gpa'] or 0
        current_credits = current_result['total_credits_completed']
        
        # Remaining courses
        remaining_credits = 0
        for code in remaining_courses:
            materia = pensum.get_materia(code)
            if materia and materia.grade is None:
                remaining_credits += materia.credits
        
        if remaining_credits == 0:
            return {
                'achievable': current_gpa >= target_gpa,
                'needed_average': None,
                'message': 'No remaining courses to grade'
            }
        
        # Calculate needed grade
        # target_gpa = (current_points + needed_points) / total_credits
        # needed_points = target_gpa * total_credits - current_points
        # needed_average = needed_points / remaining_credits
        
        current_points = current_gpa * current_credits
        total_credits = current_credits + remaining_credits
        needed_points = target_gpa * total_credits - current_points
        needed_average = needed_points / remaining_credits
        
        achievable = 0 <= needed_average <= config.gpa_scale
        
        return {
            'target_gpa': target_gpa,
            'current_gpa': round(current_gpa, 2),
            'needed_average': round(needed_average, 2),
            'remaining_credits': remaining_credits,
            'achievable': achievable,
            'message': (
                f"Need an average of {round(needed_average, 2)} in remaining {remaining_credits} credits"
                if achievable else
                f"Target GPA of {target_gpa} is not achievable with remaining courses"
            )
        }
    
    @staticmethod
    def check_gpa_alerts(
        pensum: Pensum,
        config: Configuracion = None
    ) -> list[dict]:
        """
        Check for GPA alerts based on thresholds
        
        Args:
            pensum: Current pensum
            config: Configuration with threshold
            
        Returns:
            List of alert dicts
        """
        if config is None:
            config = Configuracion()
        
        alerts = []
        
        # Check cumulative GPA
        cumulative = GPAService.calculate_cumulative_gpa(pensum, config)
        if cumulative['cumulative_gpa'] is not None:
            if cumulative['cumulative_gpa'] < config.gpa_alert_threshold:
                alerts.append({
                    'type': 'cumulative_gpa_low',
                    'severity': 'warning',
                    'message': f"Cumulative GPA ({cumulative['cumulative_gpa']}) is below threshold ({config.gpa_alert_threshold})",
                    'value': cumulative['cumulative_gpa'],
                    'threshold': config.gpa_alert_threshold
                })
        
        # Check each semester
        for sem, sem_data in cumulative.get('semesters', {}).items():
            if sem_data['gpa'] is not None and sem_data['gpa'] < config.gpa_alert_threshold:
                alerts.append({
                    'type': 'semester_gpa_low',
                    'severity': 'info',
                    'message': f"Semester {sem} GPA ({sem_data['gpa']}) is below threshold ({config.gpa_alert_threshold})",
                    'semester': sem,
                    'value': sem_data['gpa'],
                    'threshold': config.gpa_alert_threshold
                })
        
        # Check for failed courses
        if cumulative['total_failed'] > 0:
            alerts.append({
                'type': 'failed_courses',
                'severity': 'warning',
                'message': f"You have {cumulative['total_failed']} failed course(s)",
                'value': cumulative['total_failed']
            })
        
        return alerts
    
    @staticmethod
    def get_academic_progress(
        pensum: Pensum,
        config: Configuracion = None
    ) -> dict:
        """
        Get comprehensive academic progress summary
        
        Args:
            pensum: Current pensum
            config: Configuration
            
        Returns:
            Dict with progress metrics
        """
        if config is None:
            config = Configuracion()
        
        cumulative = GPAService.calculate_cumulative_gpa(pensum, config)
        alerts = GPAService.check_gpa_alerts(pensum, config)
        
        # Count courses by status
        status_counts = {
            'pending': 0,
            'enrolled': 0,
            'passed': 0,
            'failed': 0,
            'dropped': 0,
            'blocked': 0
        }
        
        for materia in pensum.materias:
            status_counts[materia.status.value] = status_counts.get(materia.status.value, 0) + 1
        
        return {
            'cumulative_gpa': cumulative['cumulative_gpa'],
            'credits_completed': cumulative['total_credits_completed'],
            'credits_total': cumulative['total_credits_pensum'],
            'progress_percentage': cumulative['progress_percentage'],
            'courses_passed': status_counts['passed'],
            'courses_failed': status_counts['failed'],
            'courses_pending': status_counts['pending'],
            'courses_enrolled': status_counts['enrolled'],
            'courses_blocked': status_counts['blocked'],
            'total_courses': len(pensum.materias),
            'alerts': alerts,
            'gpa_trend': GPAService._calculate_gpa_trend(cumulative.get('semesters', {}))
        }
    
    @staticmethod
    def _calculate_gpa_trend(semesters: dict) -> str:
        """Calculate GPA trend (improving, declining, stable)"""
        gpas = [s['gpa'] for s in semesters.values() if s.get('gpa') is not None]
        
        if len(gpas) < 2:
            return 'insufficient_data'
        
        # Compare last 2 semesters with graded courses
        recent = gpas[-2:]
        if recent[1] > recent[0] + 0.1:
            return 'improving'
        elif recent[1] < recent[0] - 0.1:
            return 'declining'
        else:
            return 'stable'
