"""
Auth Blueprint
Routes for authentication pages
"""
from flask import Blueprint, render_template

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


@auth_bp.route('/confirm')
def confirm_email():
    """Email confirmation page - handles Supabase redirect"""
    return render_template('auth/confirm.html')


@auth_bp.route('/reset-password')
def reset_password():
    """Password reset page"""
    return render_template('auth/reset_password.html')
