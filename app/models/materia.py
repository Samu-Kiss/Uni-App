"""
Materia (Course) Model
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from enum import Enum


class MateriaStatus(str, Enum):
    """Status of a course in the pensum"""
    PENDING = "pending"      # Not yet taken
    ENROLLED = "enrolled"    # Currently enrolled
    PASSED = "passed"        # Successfully completed
    FAILED = "failed"        # Failed/Lost
    DROPPED = "dropped"      # Withdrawn
    BLOCKED = "blocked"      # Cannot take due to prerequisites


class Materia(BaseModel):
    """
    Represents a course/subject in the academic pensum
    """
    code: str = Field(..., min_length=1, max_length=20, description="Course code, e.g., 'CALC101'")
    name: str = Field(..., min_length=1, max_length=100, description="Course name")
    credits: int = Field(..., ge=1, le=10, description="Number of credits")
    semester: int = Field(..., ge=1, le=15, description="Semester number in pensum")
    prerequisites: list[str] = Field(default_factory=list, description="List of prerequisite course codes")
    corequisites: list[str] = Field(default_factory=list, description="List of corequisite/coterminal course codes")
    color: Optional[str] = Field(default=None, pattern=r'^#[0-9A-Fa-f]{6}$', description="Hex color for UI")
    status: MateriaStatus = Field(default=MateriaStatus.PENDING, description="Current status of the course")
    grade: Optional[float] = Field(default=None, ge=0.0, le=5.0, description="Final grade (0-5 scale)")
    
    @field_validator('code')
    @classmethod
    def code_uppercase(cls, v: str) -> str:
        """Normalize course code to uppercase"""
        return v.upper().strip()
    
    @field_validator('prerequisites', 'corequisites')
    @classmethod
    def codes_uppercase(cls, v: list[str]) -> list[str]:
        """Normalize all course codes to uppercase"""
        return [code.upper().strip() for code in v]
    
    def is_available(self, passed_courses: set[str], enrolled_courses: set[str]) -> bool:
        """
        Check if course can be taken based on prerequisites and corequisites
        
        Args:
            passed_courses: Set of course codes that have been passed
            enrolled_courses: Set of course codes currently enrolled (including this potential enrollment)
        
        Returns:
            True if all requirements are met
        """
        # Check prerequisites (must be passed)
        for prereq in self.prerequisites:
            if prereq not in passed_courses:
                return False
        
        # Check corequisites (must be passed OR enrolled in same semester)
        for coreq in self.corequisites:
            if coreq not in passed_courses and coreq not in enrolled_courses:
                return False
        
        return True
    
    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization"""
        return {
            'code': self.code,
            'name': self.name,
            'credits': self.credits,
            'semester': self.semester,
            'prerequisites': self.prerequisites,
            'corequisites': self.corequisites,
            'color': self.color,
            'status': self.status.value,
            'grade': self.grade
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Materia':
        """Create Materia from dictionary"""
        if 'status' in data and isinstance(data['status'], str):
            data['status'] = MateriaStatus(data['status'])
        return cls(**data)


class Pensum(BaseModel):
    """
    Complete academic pensum containing all courses
    """
    materias: list[Materia] = Field(default_factory=list)
    name: str = Field(default="Mi Pensum", description="Name of the pensum")
    total_credits: int = Field(default=0, description="Total credits in pensum")
    
    def model_post_init(self, __context) -> None:
        """Calculate total credits after initialization"""
        self.total_credits = sum(m.credits for m in self.materias)
    
    def get_materia(self, code: str) -> Optional[Materia]:
        """Get a course by code"""
        code = code.upper()
        for m in self.materias:
            if m.code == code:
                return m
        return None
    
    def get_semester_materias(self, semester: int) -> list[Materia]:
        """Get all courses for a specific semester"""
        return [m for m in self.materias if m.semester == semester]
    
    def get_max_semester(self) -> int:
        """Get the highest semester number"""
        if not self.materias:
            return 0
        return max(m.semester for m in self.materias)
    
    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization"""
        return {
            'name': self.name,
            'materias': [m.to_dict() for m in self.materias],
            'total_credits': self.total_credits
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Pensum':
        """Create Pensum from dictionary"""
        materias = [Materia.from_dict(m) for m in data.get('materias', [])]
        return cls(
            name=data.get('name', 'Mi Pensum'),
            materias=materias
        )
