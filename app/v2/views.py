from flask import flash, redirect, render_template, url_for, request, jsonify
from flask_login import current_user, login_required
from dataclasses import dataclass
import random

from . import v2
from ..util import *
from ..models import *

@v2.route('/')
def main():
    if not check_version():
        return redirect(url_for('home.dashboard'))
    getURL('main', 'v2')

    return render_template('v2/app.html', title="Kalkulator ZSE")

@v2.route('/calc')
def noadmin():
    if not check_version():
        return redirect(url_for('home.calculator'))
    getURL('noadmin', 'v2')

    return render_template('v2/lite.html', title="Kalkulator ZSE")