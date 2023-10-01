from flask import flash, redirect, render_template, url_for, request, jsonify
from flask_login import current_user, login_required
from dataclasses import dataclass
import os
import uuid
import app
import random

from . import api
from .. import util
from ..models import *


@api.route('show_count', methods=['GET', 'POST'])
@login_required
def show_count():
    # util.check_admin()

    try:
        x = request.form['name']
        x = globals()[x]
        count = db.session.query(x).count()
    except Exception:
        count = 2137

    return jsonify(count)


@api.route('send_report', methods=['GET', 'POST'])
@login_required
def send_report():
    x = request.form['type']
    y = request.form['desc']

    if x == 'bug' or x == 'info' or x == 'other':
        bug = Info(type=x, description=y, uid=current_user.id)

        try:
            db.session.add(bug)
            db.session.commit()
            return 'OK', 200
        except Exception as e:
            util.handleException(e)
            return 'BAD', 400
    else:
        return 'BAD', 400


# verify is it really an image

@api.route('send_profile_photo', methods=['GET', 'POST'])
@login_required
def send_profile_photo():
    x = request.data
    file_ext = str(uuid.uuid4()) + '.jpg'
    open(('./app/static/user_content/profile_photo/' + file_ext), 'xb').write(x)

    n = Employee.query.get_or_404(current_user.get_id())
    n.profile_photo = file_ext

    try:
        db.session.add(n)
        db.session.commit()
        return 'OK', 200
    except Exception as e:
        util.handleException(e)
        return 'BAD', 400
    else:
        return 'BAD', 400


@api.route('send_bg_photo', methods=['GET', 'POST'])
@login_required
def send_bg_photo():
    util.check_admin()
    x = request.data
    file_ext = str(uuid.uuid4()) + '.jpg'
    open(('./app/static/user_content/background_photo/' + file_ext), 'xb').write(x)

    n = Setting.query.filter_by(name="bg_photo").first()
    n.value = 'user_content/background_photo/' + file_ext

    try:
        db.session.add(n)
        db.session.commit()
        return 'OK', 200
    except Exception as e:
        util.handleException(e)
        return 'BAD', 400
    else:
        return 'BAD', 400


@api.route('send_appname', methods=['GET', 'POST'])
@login_required
def send_appname():
    util.check_admin()
    x = request.form['name']

    n = Setting.query.filter_by(name="app_name").first()
    n.value = x

    try:
        db.session.add(n)
        db.session.commit()
        return 'OK', 200
    except Exception as e:
        util.handleException(e)
        return 'BAD', 400
    else:
        return 'BAD', 400


@api.route('send_footer_photo', methods=['GET', 'POST'])
@login_required
def send_footer_photo():
    util.check_admin()
    x = request.data
    file_ext = str(uuid.uuid4()) + '.jpg'
    open(('./app/static/user_content/footer_photo/' + file_ext), 'xb').write(x)

    n = Setting.query.filter_by(name="footer_photo").first()
    n.value = 'user_content/footer_photo/' + file_ext

    try:
        db.session.add(n)
        db.session.commit()
        return 'OK', 200
    except Exception as e:
        util.handleException(e)
        return 'BAD', 400
    else:
        return 'BAD', 400


@api.route('list_employees', methods=['GET', 'POST'])
@login_required
def list_employees():
    util.check_admin()

    employees = Employee.query.all()

    return jsonify(employees)


@api.route('list_departments', methods=['GET', 'POST'])
@login_required
def list_departments():
    departments = Department.query.all()

    # util.check_admin()

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
            dd = [dp.id, dp.name]
            did.append(dd)
    else:
        for dp in departments:
            for p in perm:
                if dp.id == p.permissionid:
                    dd = [dp.id, dp.name]
                    did.append(dd)

    return jsonify(did)


@api.route('list_roles', methods=['GET', 'POST'])
@login_required
def list_roles():
    roles = Role.query.all()
    n = []

    for r in roles:
        owning = RoleUser.query.filter_by(roleid=r.id).count()
        m = {'id': r.id, 'name': r.name, 'description': r.description, 'value': r.value, 'multiple': r.multiple,
             'parent_id': r.parent_id, 'owning': owning}
        n.append(m)

    return jsonify(n)


@api.route('get_depart_by_id', methods=['GET', 'POST'])
@login_required
def get_depart_by_id():
    util.check_admin()

    if request.form['id']:
        id = request.form['id']
    else:
        return 'ERR', 400

    try:
        department = Department.query.get_or_404(id)
    except Exception:
        return 'ERR', 400

    return jsonify(department.name, department.description, department.master_name)

@api.route('update_depart_by_id', methods=['GET', 'POST'])
@login_required
def update_depart_by_id():
    util.check_admin()

    if request.form['id']:
        id = request.form['id']
    else:
        return 'ERR', 400

    try:
        department = Department.query.get_or_404(id)
    except Exception:
        return 'ERR', 400

    try:
        if request.form['name']:
            department.name = request.form['name']
    except Exception:
        pass
    try:
        if request.form['description']:
            department.description = request.form['description']
    except Exception:
        pass
    try:
        if request.form['master_name']:
            department.master_name = request.form['master_name']
    except Exception:
        pass

    try:
        db.session.add(department)
        db.session.commit()
    except Exception:
        return 'ERR', 400

    return 'OK', 200

@api.route('list_role_parents', methods=['GET', 'POST'])
@login_required
def list_role_parents():
    roles = RoleParent.query.all()

    return jsonify(roles)


@api.route('list_reports', methods=['GET', 'POST'])
@login_required
def list_reports():
    util.check_admin()

    try:
        if request.form['limit']:
            x = request.form['limit']
            reports = Info.query.all()[-x]
    except:
        reports = Info.query.all()

    return jsonify(reports)


@api.route('remove_report', methods=['GET', 'POST'])
@login_required
def remove_report():
    util.check_admin()

    try:
        if request.form['id']:
            x = request.form['id']
            conn = Info.query.get_or_404(x)
            db.session.delete(conn)
            db.session.commit()
            return 'OK', 200
    except Exception as e:
        util.handleException(e)
        return 'ERR', 400

    return jsonify("OK")


@api.route('create_student', methods=['GET', 'POST'])
@login_required
def create_student():
    x = request.form['type']
    y = request.form['desc']

    if x == 'bug' or x == 'info' or x == 'other':
        bug = Info(type=x, description=y)

        try:
            db.session.add(bug)
            db.session.commit()
            return 'OK', 200
        except Exception as e:
            util.handleException(e)
            return 'BAD', 400
    else:
        return 'BAD', 400


@api.route('create_depart', methods=['GET', 'POST'])
@login_required
def create_depart():
    x = request.form['name']
    y = request.form['desc']

    dep = Department(name=x, description=y)

    try:
        db.session.add(dep)
        db.session.commit()
        v = PermissionUser(userid=current_user.id, permissionid=dep.id)
        db.session.add(v)
        db.session.commit()
        return 'OK', 200
    except Exception as e:
        util.handleException(e)
        return 'BAD', 400
    else:
        return 'BAD', 400


@api.route('create_category', methods=['GET', 'POST'])
@login_required
def create_category():
    x = request.form['name']
    y = request.form['desc']
    z = request.form['value']
    aa = request.form['times']
    ab = request.form['parent']

    print(aa, ab)

    if aa == 'false':
        b = True
    else:
        b = False

    cat = Role(name=x, description=y, value=z, multiple=b, parent_id=ab)

    try:
        db.session.add(cat)
        db.session.commit()
        return 'OK', 200
    except Exception as e:
        util.handleException(e)
        return 'BAD', 400
    else:
        return 'BAD', 400


@api.route('create_category_parent', methods=['GET', 'POST'])
@login_required
def create_category_parent():
    x = request.form['name']
    y = request.form['color']

    cat = RoleParent(name=x, color=y)

    try:
        db.session.add(cat)
        db.session.commit()
        return 'OK', 200
    except Exception as e:
        util.handleException(e)
        return 'BAD', 400
    else:
        return 'BAD', 400


@api.route('get_depart_objects', methods=['GET', 'POST'])
@login_required
def get_depart_objects():
    objects = []

    if current_user.is_admin:
        try:
            if request.form['id']:
                x = request.form['id']
                o = Object.query.filter_by(department_id=x).all()
                objects.append(o)
                print(o)
        except Exception as e:
            util.handleException(e)
            return 'ERR', 400
    else:
        z = PermissionUser.query.filter_by(userid=current_user.id, permissionid=request.form['id'])
        if z:
            x = request.form['id']
            o = Object.query.filter_by(department_id=x).all()
            objects.append(o)

    return jsonify(objects)


@api.route('add_depart_object', methods=['GET', 'POST'])
@login_required
def add_depart_object():
    #TODO safety
    try:
        if request.form['id']:
            x = request.form['id']
            q = request.form['first_name']
            y = request.form['last_name']
            z = request.form['comment']
            cat = Object(first_name=q, last_name=y, comment=z, department_id=x)

            try:
                db.session.add(cat)
                db.session.commit()
                return 'OK', 200
            except Exception as e:
                util.handleException(e)
                return 'BAD', 400
            else:
                return 'BAD', 400
    except Exception as e:
        util.handleException(e)
        return 'ERR', 400

    return 'ERR', 400


@api.route('get_object_points_for_view', methods=['GET', 'POST'])
@login_required
def get_object_points_for_view():
    util.check_admin()
    points = []

    try:
        if request.form['id']:
            x = request.form['id']
            o = Object.query.filter_by(id=x).first()
            c = RoleUser.query.filter_by(userid=x).all()
            r = Role.query.all()
            for x in r:
                for y in c:
                    if x.id == y.roleid:
                        v = []
                        v.append(x.name)
                        v.append(x.value)
                        points.append(v)
    except Exception as e:
        util.handleException(e)
        return 'ERR', 400

    return jsonify(points)


@api.route('get_object_points_for_view2', methods=['GET', 'POST'])
@login_required
def get_object_points_for_view2():
    #util.check_admin()
    #todo safety
    points = []

    try:
        if request.form['id']:
            x = request.form['id']
            r = Role.query.all()
            for t in r:
                m = RoleUser.query.filter_by(userid=x, roleid=t.id).first()
                if m:
                    v = []
                    v.append(t.id)
                    v.append(m.value)
                    v.append(t.value)
                    points.append(v)
                    print(v)
                else:
                    v = []
                    v.append(t.id)
                    v.append(0)
                    v.append(t.value)
                    points.append(v)
                    print(v)
    except Exception as e:
        util.handleException(e)
        return 'ERR', 400

    return jsonify(points)


@api.route('get_logs', methods=['GET', 'POST'])
@login_required
def get_logs():
    util.check_admin()
    points = []

    o = Log.query.all()
    for x in o:
        points.append(x.comment)

    return jsonify(points)


@api.route('remove_logs', methods=['GET', 'POST'])
@login_required
def remove_logs():
    util.check_admin()

    db.session.query(Log).delete()
    db.session.commit()

    return 'OK', 200


@api.route('get_rapports', methods=['GET', 'POST'])
@login_required
def get_rapports():
    util.check_admin()
    points = []

    o = Info.query.all()

    return jsonify(o)


@api.route('remove_rapports', methods=['GET', 'POST'])
@login_required
def remove_rapports():
    util.check_admin()

    db.session.query(Info).delete()
    db.session.commit()

    return 'OK', 200


@api.route('remove_employee', methods=['GET', 'POST'])
@login_required
def delete_user():
    util.check_admin()

    if request.form['id']:
        id = request.form['id']
    else:
        return 'ERR', 400

    if int(id) == int(current_user.id):
        return 'Nie można usuwać samego siebie', 400
    elif int(id) != int(current_user.id):
        try:
            employee = Employee.query.get_or_404(id)
            db.session.delete(employee)
            db.session.commit()
        except Exception:
            return 'ERR', 400

    return 'OK', 200


@api.route('remove_category', methods=['GET', 'POST'])
@login_required
def delete_category():
    util.check_admin()

    if request.form['id']:
        id = request.form['id']
    else:
        return 'Błędne zapytanie', 400

    try:
        category = RoleParent.query.get_or_404(id)
        db.session.delete(category)
        db.session.commit()
    except Exception:
        return 'Wystąpił jakiś błąd po drodze', 400

    return 'OK', 200


@api.route('remove_class', methods=['GET', 'POST'])
@login_required
def delete_class():
    util.check_admin()

    if request.form['id']:
        id = request.form['id']
    else:
        return 'Błędne zapytanie', 400

    try:
        category = Department.query.get_or_404(id)
        db.session.delete(category)
        db.session.commit()
    except Exception:
        return 'Wystąpił jakiś błąd po drodze', 400

    return 'OK', 200


@api.route('remove_student', methods=['GET', 'POST'])
@login_required
def delete_student():
    util.check_admin()

    if request.form['id']:
        id = request.form['id']
    else:
        return 'Błędne zapytanie', 400

    try:
        category = Object.query.get_or_404(id)
        db.session.delete(category)
        db.session.commit()
    except Exception:
        return 'Wystąpił jakiś błąd po drodze', 400

    return 'OK', 200


@api.route('remove_subcategory', methods=['GET', 'POST'])
@login_required
def delete_subcategory():
    util.check_admin()

    if request.form['id']:
        id = request.form['id']
    else:
        return 'ERR', 400

    try:
        category = Role.query.get_or_404(id)
        db.session.delete(category)
        db.session.commit()
    except Exception:
        return 'ERR', 400

    return 'OK', 200


@api.route('get_design', methods=['GET', 'POST'])
def get_design():
    try:
        name = Setting.query.filter_by(name="app_name").first()
        author = Setting.query.filter_by(name="author").first()
        version = Setting.query.filter_by(name="version").first()
        url1 = Setting.query.filter_by(name="bg_photo").first()
        url2 = Setting.query.filter_by(name="footer_photo").first()
        url3 = Setting.query.filter_by(name="login_photo").first()
    except Exception:
        return 'ERR', 400

    return jsonify(name.value, author.value, version.value, url1.value, url2.value, url3.value)


@api.route('get_value', methods=['GET', 'POST'])
def get_value():
    try:
        returned = []
        if request.form['type']:
            t = request.form['type'].split()
        else:
            return 'ERR', 400
        for i in t:
            name = Setting.query.filter_by(name=i).first()
            returned.append(name.value)
    except Exception:
        return 'ERR', 400

    return jsonify(returned)


@api.route('add_point', methods=['GET', 'POST'])
@login_required
def add_point():
    #todo safety
    #util.check_admin()
    try:
        if request.form['value']:
            v = request.form['value']
            v = int(v)
        else:
            return 'ERR', 400
        if request.form['id']:
            i = request.form['id']
        else:
            return 'ERR', 400
        if request.form['user']:
            t = request.form['user']
        else:
            return 'ERR', 400
    except Exception:
        return 'ERR', 400
    # TODO make it search for count and find who added which points
    try:
        p = RoleUser.query.filter_by(userid=t, roleid=i).first()
        if p:
            r = Role.query.filter_by(id=i).first()
            if r.multiple:
                p.value = p.value + v
            else:
                if v == 0 or v == 1:
                    p.value = v
            db.session.commit()
        else:
            r = Role.query.filter_by(id=i).first()
            if r.multiple:
                p = RoleUser(userid=t, roleid=i, value=v)
            else:
                if v == 0 or v == 1:
                    p = RoleUser(userid=t, roleid=i, value=v)
            db.session.add(p)
            db.session.commit()
    except Exception as e:
        util.handleException(e)
        return 'ERR', 400

    return 'OK', 200


@api.route('set_value', methods=['GET', 'POST'])
@login_required
def set_value():
    util.check_admin()
    try:
        if request.form['type']:
            t = request.form['type']
        else:
            return 'ERR', 400
        if request.form['value']:
            v = request.form['value']
        else:
            return 'ERR', 400

        s = Setting.query.filter_by(name=t).first()
        s.value = v
        db.session.add(s)
        db.session.commit()

    except Exception:
        return 'ERR', 400

    return 'OK', 200


@api.route('update_object', methods=['GET', 'POST'])
@login_required
def update_object():
    try:
        if request.form['id']:
            t = request.form['id']
        else:
            return 'ERR', 400
        if request.form['key']:
            u = request.form['key']
        else:
            return 'ERR', 400
        if request.form['value']:
            v = request.form['value']
        else:
            return 'ERR', 400

        s = Object.query.filter_by(id=t).first()
        setattr(s, u, v)

        db.session.add(s)
        db.session.commit()

    except Exception:
        return 'ERR', 400

    return 'OK', 200


@api.route('update_employee', methods=['GET', 'POST'])
@login_required
def update_employee():
    util.check_admin()
    try:
        if request.form['id']:
            t = request.form['id']
        else:
            return 'ERR', 400
        if request.form['key']:
            u = request.form['key']
        else:
            return 'ERR', 400
        if request.form['value']:
            v = request.form['value']
        else:
            return 'ERR', 400

        s = Employee.query.filter_by(id=t).first()
        setattr(s, u, v)

        db.session.add(s)
        db.session.commit()

    except Exception:
        return 'ERR', 400

    return 'OK', 200


@api.route('add_object_note', methods=['GET', 'POST'])
@login_required
def add_object_note():
    try:
        if request.form['id']:
            t = request.form['id']
        else:
            return 'ERR', 400
        if request.form['note']:
            u = request.form['note']
        else:
            return 'ERR', 400
        try:
            if request.form['value']:
                v = request.form['value']
            else:
                v = 0
        except Exception:
            v = 0

        n = Note()
        n.value = v
        n.body = u
        n.user_id = t

        db.session.add(n)
        db.session.commit()
        return 'OK', 200
    except Exception:
        return 'ERR', 400


@api.route('remove_object_note', methods=['GET', 'POST'])
@login_required
def remove_object_note():
    try:
        if request.form['id']:
            t = request.form['id']
        else:
            return 'ERR', 400

        n = Note.query.filter_by(id=t).first()

        db.session.delete(n)
        db.session.commit()
        return 'OK', 200
    except Exception:
        return 'ERR', 400


@api.route('get_object_notes', methods=['GET', 'POST'])
@login_required
def get_object_notes():
    try:
        if request.form['id']:
            t = request.form['id']
        else:
            return 'ERR', 400

        n = Note.query.filter_by(user_id=t).all()
        notes = []
        for x in n:
            note = []
            note.append(x.id)
            note.append(x.body)
            note.append(x.value)
            notes.append(note)

        return jsonify(notes)
    except Exception:
        return 'ERR', 400


@api.route('update_category', methods=['GET', 'POST'])
@login_required
def update_category():
    util.check_admin()
    try:
        if request.form['id']:
            t = request.form['id']
        else:
            return 'ERR', 400
        if request.form['key']:
            u = request.form['key']
        else:
            return 'ERR', 400
        if request.form['value']:
            v = request.form['value']
        else:
            return 'ERR', 400

        s = RoleParent.query.filter_by(id=t).first()
        setattr(s, u, v)

        db.session.add(s)
        db.session.commit()

    except Exception:
        return 'ERR', 400

    return 'OK', 200


@api.route('create_employee', methods=['POST'])
@login_required
def create_employee():
    try:
        first_name = request.form.get('first_name', '')
        last_name = request.form.get('last_name', '')
        email = request.form.get('email', '')
        password = request.form.get('password', '12PassToChange#@$%*')
        username = request.form.get('username', f'{first_name[:3]}{last_name[:3]}{random.randint(10, 90)}')
        is_admin = bool(request.form.get('is_admin', False))

        e = Employee(first_name=first_name, last_name=last_name, email=email, password=password, username=username, is_admin=is_admin)

        db.session.add(e)
        db.session.commit()

    except Exception:
        return 'ERR', 400

    return 'OK', 200


@api.route('get_my_data', methods=['GET', 'POST'])
@login_required
def get_my_data():
    try:
        t = Employee.query.get_or_404(current_user.get_id())

        data = {'id': t.id, 'first_name': t.first_name, 'last_name': t.last_name, 'email': t.email, 'username': t.username, 'profile_photo': t.profile_photo}

        return jsonify(data)
    except Exception:
        return 'ERR', 400


@api.route('update_subcategory', methods=['GET', 'POST'])
@login_required
def update_subcategory():
    util.check_admin()
    try:
        if request.form['id']:
            t = request.form['id']
        else:
            return 'ERR', 400
        if request.form['key']:
            u = request.form['key']
        else:
            return 'ERR', 400
        if request.form['value']:
            v = request.form['value']
        else:
            return 'ERR', 400

        if u == 'multiple':
            if v == 'true' or v == 1:
                v = True
            else:
                v = False

        s = Role.query.filter_by(id=t).first()
        setattr(s, u, v)

        db.session.add(s)
        db.session.commit()

    except Exception:
        return 'ERR', 400

    return 'OK', 200

@api.route('update_password', methods=['GET', 'POST'])
@login_required
def update_password():
    try:
        t = Employee.query.get_or_404(current_user.get_id())

        if request.form['password']:
            u = request.form['password']
        else:
            return 'ERR', 400

        s = Employee.query.filter_by(id=t).first() # TODO bug here
        s.password = u
        db.session.add(s)
        db.session.commit()

    except Exception:
        return 'ERR', 400

    return 'OK', 200