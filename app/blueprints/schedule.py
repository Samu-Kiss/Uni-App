"""
Schedule Blueprint
Routes for schedule management and generation
"""
from flask import Blueprint, render_template, request

schedule_bp = Blueprint('schedule', __name__, url_prefix='/schedule')


@schedule_bp.route('/')
def index():
    """Schedule management page"""
    return render_template('schedule/index.html')


@schedule_bp.route('/combinations')
def combinations():
    """View generated schedule combinations"""
    return render_template('schedule/combinations.html')
