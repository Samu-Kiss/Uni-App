"""
Horario (Schedule) related models
"""
from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum
from app.models.clase import DayOfWeek, BloqueHorario, Clase


class FranjaStatus(str, Enum):
    """Status of a time slot preference"""
    BLOCKED = "blocked"      # Time slot not available
    PREFERRED = "preferred"  # Preferred time slot


class Franja(BaseModel):
    """
    A time slot preference (blocked or preferred)
    """
    day: DayOfWeek = Field(..., description="Day of the week")
    start: str = Field(..., pattern=r'^([01]?[0-9]|2[0-3]):[0-5][0-9]$', description="Start time HH:MM")
    end: str = Field(..., pattern=r'^([01]?[0-9]|2[0-3]):[0-5][0-9]$', description="End time HH:MM")
    status: FranjaStatus = Field(..., description="Whether this slot is blocked or preferred")
    
    def to_bloque(self) -> BloqueHorario:
        """Convert to BloqueHorario for conflict checking"""
        return BloqueHorario(day=self.day, start=self.start, end=self.end)
    
    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization"""
        return {
            'day': self.day.value,
            'start': self.start,
            'end': self.end,
            'status': self.status.value
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Franja':
        """Create Franja from dictionary"""
        return cls(
            day=DayOfWeek(data['day']),
            start=data['start'],
            end=data['end'],
            status=FranjaStatus(data['status'])
        )


class HorarioCombination(BaseModel):
    """
    A valid schedule combination
    """
    id: str = Field(..., description="Unique identifier for this combination")
    clases: list[Clase] = Field(default_factory=list, description="List of selected classes")
    total_credits: int = Field(default=0, description="Total credits in this schedule")
    
    # Scoring metrics
    free_days: int = Field(default=0, description="Number of free days")
    gaps_count: int = Field(default=0, description="Number of gaps between classes")
    gaps_minutes: int = Field(default=0, description="Total minutes in gaps")
    preferred_slots_used: int = Field(default=0, description="Number of preferred time slots used")
    earliest_start: str = Field(default="23:59", description="Earliest class start time")
    latest_end: str = Field(default="00:00", description="Latest class end time")
    
    def calculate_metrics(self, franjas: list[Franja] = None) -> None:
        """
        Calculate schedule quality metrics
        
        Args:
            franjas: List of time slot preferences
        """
        if not self.clases:
            return
        
        # Collect all blocks by day
        days_used: dict[str, list[BloqueHorario]] = {}
        all_days = set(d.value for d in DayOfWeek)
        
        for clase in self.clases:
            for block in clase.schedule:
                day_val = block.day.value
                if day_val not in days_used:
                    days_used[day_val] = []
                days_used[day_val].append(block)
        
        # Calculate free days (excluding Sunday)
        weekdays = {'L', 'M', 'W', 'J', 'V', 'S'}
        self.free_days = len(weekdays - set(days_used.keys()))
        
        # Calculate gaps and time range
        total_gaps = 0
        total_gap_minutes = 0
        earliest = 24 * 60
        latest = 0
        
        for day, blocks in days_used.items():
            # Sort blocks by start time
            sorted_blocks = sorted(blocks, key=lambda b: b.get_start_minutes())
            
            # Track earliest and latest
            if sorted_blocks:
                earliest = min(earliest, sorted_blocks[0].get_start_minutes())
                latest = max(latest, sorted_blocks[-1].get_end_minutes())
            
            # Calculate gaps between consecutive blocks
            for i in range(len(sorted_blocks) - 1):
                current_end = sorted_blocks[i].get_end_minutes()
                next_start = sorted_blocks[i + 1].get_start_minutes()
                gap = next_start - current_end
                if gap > 0:
                    total_gaps += 1
                    total_gap_minutes += gap
        
        self.gaps_count = total_gaps
        self.gaps_minutes = total_gap_minutes
        self.earliest_start = f"{earliest // 60:02d}:{earliest % 60:02d}"
        self.latest_end = f"{latest // 60:02d}:{latest % 60:02d}"
        
        # Calculate preferred slots used
        if franjas:
            preferred_franjas = [f for f in franjas if f.status == FranjaStatus.PREFERRED]
            preferred_count = 0
            
            for clase in self.clases:
                for block in clase.schedule:
                    for pref in preferred_franjas:
                        pref_block = pref.to_bloque()
                        # Check if class block falls within preferred time
                        if (block.day == pref_block.day and
                            block.get_start_minutes() >= pref_block.get_start_minutes() and
                            block.get_end_minutes() <= pref_block.get_end_minutes()):
                            preferred_count += 1
                            break
            
            self.preferred_slots_used = preferred_count
    
    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'clases': [c.to_dict() for c in self.clases],
            'total_credits': self.total_credits,
            'free_days': self.free_days,
            'gaps_count': self.gaps_count,
            'gaps_minutes': self.gaps_minutes,
            'preferred_slots_used': self.preferred_slots_used,
            'earliest_start': self.earliest_start,
            'latest_end': self.latest_end
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'HorarioCombination':
        """Create HorarioCombination from dictionary"""
        clases = [Clase.from_dict(c) for c in data.get('clases', [])]
        return cls(
            id=data['id'],
            clases=clases,
            total_credits=data.get('total_credits', 0),
            free_days=data.get('free_days', 0),
            gaps_count=data.get('gaps_count', 0),
            gaps_minutes=data.get('gaps_minutes', 0),
            preferred_slots_used=data.get('preferred_slots_used', 0),
            earliest_start=data.get('earliest_start', '23:59'),
            latest_end=data.get('latest_end', '00:00')
        )
