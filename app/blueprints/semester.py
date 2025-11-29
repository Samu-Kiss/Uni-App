"""
Semester Blueprint
Routes for semester view and course management
"""
from flask import Blueprint, render_template, request

semester_bp = Blueprint('semester', __name__, url_prefix='/semester')


@semester_bp.route('/')
def index():
    """Semester selection page"""
    return render_template('semester/index.html')


@semester_bp.route('/<int:semester_num>')
def view_semester(semester_num: int):
    """View specific semester"""
    return render_template('semester/view.html', semester_num=semester_num)
