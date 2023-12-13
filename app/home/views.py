from flask import abort, render_template, flash, url_for, session, redirect
from flask_login import current_user, login_required

from . import home
import random
from .. import db
from .forms import BugForm
from ..models import Info, Setting
from ..util import check_version, import_settings

from .. import util

@home.route('/')
def homepage():
    util.getURL('homepage', 'home')
    try:
        if current_user.is_authenticated:
            admin = util.check_admin()
            if admin:
                return redirect(url_for('home.dashboard'))
            else:
                return redirect(url_for('home.calculator'))
        else:
            return redirect(url_for('auth.login'))
    except:
        return redirect(url_for('auth.login'))

@home.route('/zx')
@login_required
def dashboard():
    if check_version():
        return redirect(url_for('v2.main'))
    util.getURL('dashboard', 'home')

    tips = ["Z tej strony można korzystać używając komputera.",
            "By korzystać z tej strony, potrzebujesz przeglądarki internetowej.",
            "W coraz to nowszych wersjach tej strony pojawiają sie nowe funkcje",
            "W tej wersji strony zostało ułatwione masowe dodawanie punktów."]
    tip = random.choice(tips)
    return render_template('home/admin_dashboard.html', title="Panel", tip=tip)

@home.route('/zx')
@login_required
def calculator():
    if check_version():
        return redirect(url_for('v2.noadmin'))
    util.getURL('calculator', 'home')

    tips = ["Z tej strony można korzystać używając komputera.",
            "By korzystać z tej strony, potrzebujesz przeglądarki internetowej.",
            "W coraz to nowszych wersjach tej strony pojawiają sie nowe funkcje",
            "W tej wersji strony zostało ułatwione masowe dodawanie punktów."]
    tip = random.choice(tips)
    return render_template('home/dashboard.html', title="Panel", tip=tip)

@home.route('/zz')
@login_required
def docs():
    back = session['url']
    return render_template('home/docs.html', back=back, title="Dokumentacja")


@home.route('/zy', methods=['GET', 'POST'])
@login_required
def bug():
    form = BugForm()
    if form.validate_on_submit():
            bug = Info(type="bug", description=form.description.data)
            try:
                db.session.add(bug)
                db.session.commit()
                flash('Zgłoszono błąd')
                if 'url' in session:
                    return redirect(session['url'])
            except:
                flash('Błąd przy zgłaszaniu błędu :(')
                return redirect(session['url'])

    return render_template('home/bug.html', form=form, title="Zgłoś błąd")
