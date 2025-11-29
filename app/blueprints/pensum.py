"""
Pensum Blueprint
Routes for pensum visualization and management
"""
from flask import Blueprint, render_template, request, jsonify

pensum_bp = Blueprint('pensum', __name__, url_prefix='/pensum')


@pensum_bp.route('/')
def index():
    """Main pensum view page"""
    return render_template('pensum/index.html')


@pensum_bp.route('/materia/<code>')
def materia_detail(code: str):
    """View details for a specific course"""
    return render_template('pensum/materia_detail.html', code=code)
