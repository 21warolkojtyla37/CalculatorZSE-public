
from flask import abort, flash, redirect, render_template, url_for, request, session
from flask_login import current_user, login_required

from . import admin
from .. import db
from .forms import DepartmentForm, EmployeeForm, NewObjectForm, ObjectForm, RoleForm, TraitAssignForm, EmployeeAddPermForm, SettingForm
from ..models import Department, Employee, Role, RoleUser, PermissionUser, Object, Info

from .. import util

@admin.before_request
def before_request():
    if not util.canUseV1():
        return '''
        <h1>Ostrzeżenie</h1>
        Wersja 1.0.0 jest wyłączona z poziomu Ustawień. 
        Proszę użyć wersji 2.0.0 lub zmienić ustawienie.
        <a href="/v2">Wróć na bezpieczny grunt</a>
        ''', 403

        
@admin.route('a', methods=['GET', 'POST'])
@login_required
def list_departments():
    util.check_admin()

    departments = Department.query.all()

    util.getURL('list_departments', "admin")

    return render_template('admin/departments/departments.html',
                           departments=departments, title='Oddziały')


@admin.route('b', methods=['GET', 'POST'])
@login_required
def add_department():
    util.check_admin()

    add_department = True

    form = DepartmentForm()
    if form.validate_on_submit():
        department = Department(name=form.name.data,
                                description=form.description.data)
        try:
            db.session.add(department)
            db.session.commit()
            flash('Dodałeś nowy oddział!')
        except:
            flash('Oddział o takiej nazwie już istnieje!')
        return redirect(url_for('admin.list_departments'))

    return render_template('admin/departments/department.html', action='Add',
                           add_department=add_department, form=form,
                           title='Dodawanie oddziału')

@admin.route('c&<int:id>', methods=['GET', 'POST'])
@login_required
def edit_department(id):
    util.check_admin()

    add_department = False

    department = Department.query.get_or_404(id)
    form = DepartmentForm(obj=department)
    if form.validate_on_submit():
        department.name = form.name.data
        department.description = form.description.data
        db.session.commit()
        flash('Poprawnie edytowałeś oddział.')

        return redirect(url_for('admin.list_departments'))

    form.description.data = department.description
    form.name.data = department.name
    return render_template('admin/departments/department.html', action='Edit',
                           add_department=add_department, form=form,
                           department=department, title='Edycja oddziału')

@admin.route('d&<int:id>', methods=['GET', 'POST'])
@login_required
def delete_department(id):
    util.check_admin()

    department = Department.query.get_or_404(id)
    db.session.delete(department)
    db.session.commit()
    flash('Pomyślnie usunięto oddział.')

    return redirect(url_for('admin.list_departments'))

@admin.route('e')
@login_required
def list_points():
    util.check_admin('Point List')

    util.getURL('list_points', 'admin')
    
    if current_user.is_admin:
        pass
    else:
        perm = PermissionUser.query.filter_by(userid=current_user.id).all()

    employees = Object.query.all()
    conn = RoleUser.query.all()
    role = Role.query.all()
    did = []
    departments = Department.query.all()
    
    if current_user.is_admin:
        for dp in departments:
            did.append(dp.id)
            did.append(dp.name) 
    else:
        for dp in departments:
            for p in perm:
                if dp.id == p.permissionid:
                    did.append(dp.id)
                    did.append(dp.name) 

    return render_template('admin/assign/departlist.html', did=did, title='Punkty')


@admin.route('f&<int:id>')
@login_required
def list_points_by_depart(id):
    util.check_admin('Point Group List', id)

    util.getURL('list_points_by_depart', id, 'admin')

    employees = Object.query.filter_by(department_id=id).all()
    conn = RoleUser.query.all()
    role = Role.query.all()
    depart = Department.query.get_or_404(id)

    return render_template('admin/assign/traits.html',
                           employees=employees, conn=conn, role=role, depart=depart, title='Punkty')


@admin.route('g&<int:id>', methods=['GET', 'POST'])
@login_required
def add_points(id):
    res = util.check_admin('Point Add', id)
    conn = RoleUser.query.all()
    role = Role.query.all()
    
    employee = Object.query.get_or_404(id)
    eid = employee.department_id
    depart = Department.query.filter_by(id = eid).first_or_404()
    
    if current_user.is_admin or res == True:
        form = TraitAssignForm(obj=employee)
        if form.validate_on_submit():
            if form.exit.data:
                if 'url' in session:
                    return redirect(session['url'])
            else:
                role = RoleUser(roleid=form.role.data.id,
                    userid=employee.id)
                db.session.add(role)
                db.session.commit()
                if form.submit.data:
                    if 'url' in session:
                        flash('Dodano!')
                        return redirect(session['url'])
                elif form.more.data:
                    flash('Dodano!')
                    return render_template('admin/assign/trait.html',
                               employee=employee, form=form, conn=conn, role=role, title='Dodaj punkt')

    else:
        abort(403)
        
    return render_template('admin/assign/trait.html',
                           employee=employee, form=form, conn=conn, role=role, title='Dodaj punkt')

@admin.route('h&<int:id>', methods=['GET', 'POST'])
@login_required
def delete_points(id):
    conn = RoleUser.query.get_or_404(id)
    role = Role.query.filter_by(id = conn.roleid)
    employee = Object.query.filter_by(id = conn.userid).first_or_404()
    sid = employee.id

    res = util.check_admin('Point Add', sid)
    
    db.session.delete(conn)
    db.session.commit()
    flash('Usunięto punkty.')

    if 'url' in session:
        return redirect(session['url'])

    return render_template(title='Usuwanie punktów')

'''
Editing points is useless, instead please use delete points/

@admin.route('/punkty/edy/<int:id>', methods=['GET', 'POST'])
@login_required
def edit_points(id):
    util.check_admin()
    
    conn = RoleUser.query.all()
    role = Role.query.all()
    
    employee = Object.query.get_or_404(id)
        
    form = TraitAssignForm(obj=employee)
    if form.validate_on_submit():
        role = RoleUser(roleid=form.role.selected,
                userid=employee.id)
        db.session.add(role)
        db.session.commit()
        flash('You have successfully assigned a department and role.')
        return redirect(url_for('admin.list_points'))
    
    return render_template('admin/assign/trait.html',
                           employee=employee, form=form, conn=conn, role=role, title='Dodaj punkt')
'''


@admin.route('i')
@login_required
def list_users():
    util.check_admin()

    util.getURL('list_users', 'admin')

    employees = Employee.query.all()
    conn = PermissionUser.query.all()
    departments = Department.query.all()

    return render_template('admin/users/users.html',
                           employees=employees, conn=conn, depart=departments, title='Administratorzy')

@admin.route('j&<int:id>', methods=['GET', 'POST'])
@login_required
def assign_user(id):
    util.check_admin()

    employee = Employee.query.get_or_404(id)

    form = EmployeeForm(obj=employee)
    if form.validate_on_submit():
        employee.email = form.email.data
        employee.first_name = form.first_name.data
        employee.last_name = form.last_name.data
        employee.is_admin = form.superadmin.data
        db.session.add(employee)
        db.session.commit()
        flash('Usunąłeś pomyślnie administratora.')

        return redirect(url_for('admin.list_users'))

    return render_template('admin/users/user.html',
                           employee=employee, form=form,
                           title='Edycja administratora')

@admin.route('l')
@login_required
def list_employees():
    util.check_admin('Point List')

    util.getURL('list_employees', 'admin')

    if current_user.is_admin:
        pass
    else:
        perm = PermissionUser.query.filter_by(userid=current_user.id).all()

    employees = Object.query.all()
    conn = RoleUser.query.all()
    role = Role.query.all()
    did = []
    departments = Department.query.all()
    
    if current_user.is_admin:
        for dp in departments:
            did.append(dp.id)
            did.append(dp.name) 
    else:
        for dp in departments:
            for p in perm:
                if dp.id == p.permissionid:
                    did.append(dp.id)
                    did.append(dp.name) 

    return render_template('admin/objects/employees.html', did=did, id=id, title='Osoby')


@admin.route('x&<int:id>')
@login_required
def list_employees_by_depart(id):
    util.check_admin('Point Group List', id)

    util.getURL('list_employees_by_depart', id, 'admin')

    employees = Object.query.filter_by(department_id=id).all()
    conn = RoleUser.query.all()
    role = Role.query.all()
    depart = Department.query.get_or_404(id)
    
    return render_template('admin/objects/employees_dep.html',
                           employees=employees, conn=conn, role=role, depart=depart, id=id, title='Osoby')


#@admin.route('l')
#@login_required
#def list_employees():
#    util.check_admin('Employee List')

#    employees = Object.query.all()
#    return render_template('admin/objects/employees.html',
#                           employees=employees, title='Osoby')


@admin.route('m&<int:id>', methods=['GET', 'POST'])
@login_required
def add_employee(id):
    util.check_admin('Point Group List', id)

    add_object = True

    form = NewObjectForm()
    if form.validate_on_submit():
        employee = Object(first_name=form.first_name.data,last_name=form.last_name.data,comment=form.comment.data,department=form.department.data)
        try:
            db.session.add(employee)
            db.session.commit()
            flash('Dodano osobę.')
        except:
            flash('Osoba o takiej nazwie już istnieje.')

        return redirect(url_for('admin.list_employees'))

    return render_template('admin/objects/employee.html', form=form, add_object=add_object, title='Dodawanie osoby')


@admin.route('n&<int:id>', methods=['GET', 'POST'])
@login_required
def edit_employee(id):
    util.check_admin('Point Add', id)
    
    employee = Object.query.get_or_404(id)

    form = ObjectForm(obj=employee)
    
    if form.validate_on_submit():
        employee.first_name = form.first_name.data
        employee.last_name = form.last_name.data
        employee.comment = form.comment.data
        employee.department_id = form.department.data.id
        db.session.add(employee)
        db.session.commit()
        flash('Pomyślnie edytowano osobę.')

        return redirect(url_for('admin.list_employees'))

    return render_template('admin/objects/employee.html',
                           employee=employee, form=form,
                           title='Edytor osoby')


@admin.route('o&<int:id>', methods=['GET', 'POST'])
@login_required
def delete_employee(id):
    util.check_admin('Point Add', id)

    employee = Object.query.get_or_404(id)
    db.session.delete(employee)
    db.session.commit()
    flash('Pomyślnie usunięto osobę!')
    
    return redirect(url_for('admin.list_employees'))

    return render_template(title='Usuwanie osoby')


'''
May be a duplicate
@admin.route('/departments/edit/<int:id>', methods=['GET', 'POST'])
@login_required
def edit_department(id):
    util.check_admin()

    add_department = False

    department = Department.query.get_or_404(id)
    form = DepartmentForm(obj=department)
    if form.validate_on_submit():
        department.name = form.name.data
        department.description = form.description.data
        db.session.commit()
        flash('You have successfully edited the department.')

        # redirect to the departments page
        return redirect(url_for('admin.list_departments'))

    form.description.data = department.description
    form.name.data = department.name
    return render_template('admin/departments/department.html', action='Edit',
                           add_department=add_department, form=form,
                           department=department, title='Edit Department')

@admin.route('/departments/delete/<int:id>', methods=['GET', 'POST'])
@login_required
def delete_department(id):
    util.check_admin()

    department = Department.query.get_or_404(id)
    db.session.delete(department)
    db.session.commit()
    flash('You have successfully deleted the department.')

    # redirect to the departments page
    return redirect(url_for('admin.list_departments'))

    return render_template(title='Delete Department')
'''


@admin.route('p')
@login_required
def list_roles():
    util.check_admin()

    util.getURL('list_roles', 'admin')

    roles = Role.query.all()

    return render_template('admin/roles/roles.html',
                           roles=roles, title='Punkty')


@admin.route('r', methods=['GET', 'POST'])
@login_required
def add_role():
    util.check_admin()
    form = RoleForm()
    add_role = True
    if form.validate_on_submit():
        role = Role(name=form.name.data,
                    description=form.description.data,
                    value=form.value.data)
        db.session.add(role)
        db.session.commit()
        flash('Dodano punkty!')
        return redirect(url_for('admin.list_roles'))
    return render_template('admin/roles/role.html', add_role=add_role,
                           form=form, title='Dodawanie punktów')


@admin.route('s&<int:id>', methods=['GET', 'POST'])
@login_required
def edit_role(id):
    util.check_admin()
    add_role = False
    role = Role.query.get_or_404(id)
    form = RoleForm(obj=role)
    if form.validate_on_submit():
        role.name = form.name.data
        role.description = form.description.data
        role.value = form.value.data
        db.session.add(role)
        db.session.commit()
        flash('Edytowano pomyślnie punkty!')
        return redirect(url_for('admin.list_roles'))
    form.description.data = role.description
    form.name.data = role.name
    return render_template('admin/roles/role.html', add_role=add_role,
                           form=form, title='Edycja punktów')


@admin.route('t&<int:id>', methods=['GET', 'POST'])
@login_required
def delete_role(id):
    util.check_admin()
    role = Role.query.get_or_404(id)
    db.session.delete(role)
    db.session.commit()
    flash('Pomyślnie usunięto punkty.')
    return redirect(url_for('admin.list_roles'))
    return render_template(title='Usuwanie punktów')


@admin.route('u&<int:id>', methods=['GET', 'POST'])
@login_required
def assign_perm(id):
    util.check_admin()

    employee = Employee.query.get_or_404(id)
    conn = PermissionUser.query.all()
    depart = Department.query.all()
    
    if employee.is_admin:
        abort(403)
        
    form = EmployeeAddPermForm(obj=employee)
    if form.validate_on_submit():
        new = PermissionUser(permissionid=form.department.data.id,
                userid=employee.id)
        db.session.add(new)
        db.session.commit()
        flash('Dodano uprawnienie pomyślnie!')
        return redirect(url_for('admin.list_users'))
    
    return render_template('admin/users/user.html',
                           employee=employee, form=form,
                           title='Edycja uprawnień administratora')


@admin.route('k&<int:id>')
@login_required
def delete_perm(id):
    util.check_admin()

    conn = PermissionUser.query.get_or_404(id)
    db.session.delete(conn)
    db.session.commit()

    flash('Pomyślnie usunięto uprawnienie.')
    return redirect(url_for('admin.list_users'))
    return render_template(title='Usuwanie uprawnienia')

@admin.route('w&<int:id>', methods=['GET', 'POST'])
@login_required
def delete_user(id):
    util.check_admin()

    employee = Employee.query.get_or_404(id)
    db.session.delete(employee)
    db.session.commit()
    flash('Pomyślnie usunięto osobę!')
    
    return redirect(url_for('admin.list_users'))

    return render_template(title='Usuwanie osoby')


@admin.route('aa', methods=['GET', 'POST'])
@login_required
def list_errors():
    util.check_admin()

    util.getURL('list_errors', 'admin')

    infos = Info.query.all()

    util.getURL('list_errors', 'admin')

    return render_template('admin/errors/errors.html',
                           infos=infos, title='Zgłoszenia')


@admin.route('ab', methods=['GET', 'POST'])
@login_required
def list_settings():
    util.check_admin()
    form = SettingForm()
    if form.validate_on_submit():
        util.change_settings(form.ver_two.data, 'pl_PL')
        flash('Udało się!')
        return redirect(url_for('admin.list_settings'))
    return render_template('admin/settings/list.html', add_role=add_role,
                           form=form, title='Ustawienia')
