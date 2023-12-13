from flask import flash, redirect, render_template, url_for, request
from flask_login import login_required, login_user, logout_user, current_user

from . import auth
from .forms import LoginForm, RegistrationForm
from .. import db
from .. import util
from ..models import Employee


@auth.route('/register', methods=['GET', 'POST'])
def register():
    x = util.get_setting_value("allow_register")
    if int(x) == 0:
        return "Nie można tu wejść"
    else:
        form = RegistrationForm()
        if form.validate_on_submit():
            employee = Employee(email=form.email.data,
                                username=form.username.data,
                                first_name=form.first_name.data,
                                last_name=form.last_name.data,
                                password=form.password.data)

            db.session.add(employee)
            db.session.commit()
            flash('Zostałeś zarejestrowany!')

            return redirect(url_for('auth.login'))

        return render_template('auth/register.html', form=form, title='Rejestracja')


@auth.route('/login', methods=['GET', 'POST'])
def login():
    try:
        if current_user.is_authenticated:
            return redirect(url_for('home.dashboard'))
    except:
        print('DB malfunction, app is probably not configured yet or it is broken. Registering is enabled for now, which may by considered as unsafe by some users.')
        util.migrate()
        return ("""DB malfunction, app is probably not configured yet or it is broken. 
                Registering is enabled for now, which may by considered as unsafe by some users. 
                (or database is so broken that even registration is unavailable)<br>
                You may try refreshing too, I implemented some kind of auto-repair.<br>
                <a href='https://github.com/21warolkojtyla37/CalculatorZSE-public/'>Clone the repo maybe?</a>
                """), 500
    try:
        x = util.get_setting_value("allow_register")
        if int(x) == 1:
            canregister = True
        else:
            canregister = False
    except:
        print('DB malfunction, app is probably not configured yet or it is broken. Registering is enabled for now, which may by considered as unsafe by some users.')
        canregister = True
    rows = db.session.query(Employee).count()
    if rows == 0:
        form = RegistrationForm()
        if form.validate_on_submit():
            employee = Employee(email=form.email.data,
                                    username=form.username.data,
                                    first_name=form.first_name.data,
                                    last_name=form.last_name.data,
                                    password=form.password.data,
                                    is_admin=True)

            db.session.add(employee)
            db.session.commit()
            util.import_settings([True, 'pl_PL', '/user_content/background_photo/default.png',
                                 '/user_content/footer_photo/default.png', 'Kalkulator ZSE',
                                 '/user_content/background_photo/default.png', 'Mikołaj Patynowski 4I2', util.version(),
                                 True, 0, 0, 1, 1, 1])
            flash('Zostałeś zarejestrowany!')
            return redirect(url_for('auth.login'))

        return render_template('auth/firstrun.html', form=form, title='Pierwsze uruchomienie')
    else:
        form = LoginForm()
        if form.validate_on_submit():
            employee = Employee.query.filter_by(email=form.email.data).first()
            if employee is not None and employee.verify_password(
                    form.password.data):
                login_user(employee)
                util.LogEx('LOGIN', form.email.data, ('GOODLOGIN ' + form.email.data + " " + request.remote_addr))

                if employee.is_admin:
                    return redirect(url_for('home.dashboard'))
                else:
                    return redirect(url_for('home.dashboard'))

            else:
                util.LogEx('LOGIN', form.email.data, ('BADLOGIN ' + request.remote_addr))
                flash('Zły email/hasło')

        return render_template('auth/login.html', form=form, title='Login', canregister=canregister)


@auth.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Zostałeś wylogowany!')

    return redirect(url_for('auth.login'))