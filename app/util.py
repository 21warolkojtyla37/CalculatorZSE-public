from flask import abort, url_for, session
from flask_login import current_user
from .models import Department, Employee, Role, RoleUser, PermissionUser, Object, Info, Log, Setting
import subprocess, sys
from . import db
from PIL import Image

def migrate():
    result = subprocess.run(['python', 'db', 'init'], stdout=subprocess.PIPE)
    result = subprocess.run(['python', 'db', 'migrate'], stdout=subprocess.PIPE)
    result = subprocess.run(['python', 'db', 'upgrade'], stdout=subprocess.PIPE)
    return result.stdout.decode('utf-8')

def version():
    return '2.3.2 (05 sty 2024)'


def check_version():
    setting = Setting.query.filter_by(name='is_dynamic').first()
    if setting.value in ['True', '1']:
        return True
    else:
        return False


def import_settings():
    Setting.query.delete()
    db.session.commit()
    settings = ['is_dynamic', 'language', 'bg_photo', 'footer_photo', 'app_name', 'login_photo', 'author', 'version',
                'allow_register', 'theme', 'color', 'is_def_bg', 'is_def_footer', 'is_def_login', 'default_threshold',
                'thresholds_j', 'doodle', 'doodles', 'user_import', 'mail_template']
    values = [True, 'pl_PL', '/user_content/background_photo/default.png',
              '/user_content/footer_photo/default.png', 'Kalkulator ZSE',
              '/user_content/background_photo/default.png', 'Mikołaj Patynowski 4I2', version(),
              True, 0, 0, 1, 1, 1, 0, '[{"name": "wzorowe", "from": 1001, "to": 9999},{"name": "bardzo dobre", "from": 501, "to": 1000},{"name": "dobre", "from": 101, "to": 500},{"name": "poprawne", "from": -99, "to": 100},{"name": "nieodpowiednie", "from": -999, "to": -100},{"name": "naganne", "from": -9999, "to": -1000}]',
              1, '[{"content": "🎆 Wszystkiego najlepszego z okazji Nowego Roku!", "from": "1900-12-27T22:36:00.000Z", "to": "1900-01-04T22:36:00.000Z"}, {"content": "🌠 Wszystkiego najlepszego z okazji Bożego Narodzenia!", "from": "1900-12-27T22:36:00.000Z", "to": "1900-01-04T22:36:00.000Z"}]',
              1, '{first_name}{last_name}@elektronikonline.pl']
    for c, s in enumerate(settings):
        setting = Setting(name=s, value=values[c])
        db.session.add(setting)
        db.session.commit()


def change_settings(setting, lang):
    version = Setting.query.filter_by(name='is_dynamic').first()
    print(version.value)
    if setting:
        version.value = 1
    else:
        version.value = 0
    db.session.commit()

    language = Setting.query.filter_by(name='language').first()
    language.value = lang
    db.session.add(language)
    db.session.commit()


def change_settings_v2(k, v):
    s = Setting.query.filter_by(name=k).first()
    s.value = v
    db.session.add(s)
    db.session.commit()


def get_setting_value(name):
    s = Setting.query.filter_by(name=name).first()
    return s.value


def check_admin(*Type):
    if current_user.is_admin:
        print("superAdmin")
        return True
    elif not current_user.is_admin:
        if len(Type) == 0:
            abort(403)
        elif Type[0] == "Point List" or Type[0] == "Employee List":
            return False
        elif Type[0] == "Point Add" or Type[0] == "Point Group List":
            if Type[0] == "Point Add":
                employee = Object.query.get_or_404(Type[1])
                eid = employee.department_id
                print(employee, eid)
            elif Type[0] == "Point Group List":
                eid = Type[1]
            # elif Type[0] == "Point Add":
            #    employee = Object.query.get_or_404(Type[1])
            #    eid = employee.department_id
            depart = Department.query.filter_by(id=eid).first_or_404()
            permconn = PermissionUser.query.filter_by(permissionid=depart.id, userid=current_user.id).first()
            if permconn == None:
                abort(403)
                print("no perm")
            else:
                print("\n \n DEpart:", depart.id, "\n USer:", current_user.id, "\n Permcon:", permconn)
                return True
        else:
            print("fajnie jest")
    else:
        abort(403)


def LogEx(*content):
    new = Log(type=content[0], user=content[1], comment=content[2])
    db.session.add(new)
    db.session.commit()


def getURL(*name):
    if len(name) == 2:
        session['url'] = url_for(name[1] + "." + name[0])
    if len(name) == 3:
        session['url'] = url_for(name[2] + "." + name[0], id=name[1])


def canUseV1():
    setting = Setting.query.filter_by(name='is_dynamic').first()
    if str(setting.value) in ['True', '1']:
        return False
    else:
        return True



def handleException(e):
    print('\033[2;31;43m')
    print(e)
    print('\033[0;0m')


def crop_image(image):
    width, height = image.size
    if width == height:
        return image
    offset = int(abs(height - width) / 2)
    if width > height:
        image = image.crop([offset, 0, width - offset, height])
    else:
        image = image.crop([0, offset, width, height - offset])
    return image
