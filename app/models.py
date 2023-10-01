from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from dataclasses import dataclass
from app import db, login_manager

@dataclass
class Employee(UserMixin, db.Model):
    id: int
    email: str
    username: str
    first_name: str
    last_name: str
    profile_photo: str
    is_admin: bool
    __tablename__ = 'employees'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(60), index=True, unique=True)
    username = db.Column(db.String(60), index=True, unique=True)
    first_name = db.Column(db.String(60), index=True)
    last_name = db.Column(db.String(60), index=True)
    password_hash = db.Column(db.String(128))
    is_admin = db.Column(db.Boolean, default=False)
    profile_photo = db.Column(db.String(60), default='default.png')
    user_settings = db.relationship("PersonalSettingOverride", back_populates="user")

    @property
    def password(self):
        raise AttributeError('password is not a readable attribute.')

    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)

    def verify_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return '<Admin: {}>'.format(self.username)


@login_manager.user_loader
def load_user(user_id):
    return Employee.query.get(int(user_id))


@dataclass
class Object(db.Model):
    id: int
    first_name: str
    last_name: str
    comment: str
    department_id: int
    role_id: int
    __tablename__ = 'objects'

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(60), index=True)
    last_name = db.Column(db.String(60), index=True)
    comment = db.Column(db.String(255), index=True)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'))
    notes = db.relationship("Note", back_populates="user")

    def __repr__(self):
        return '<Object: {}>'.format(self.first_name + self.last_name)


@login_manager.user_loader
def load_user(user_id):
    return Employee.query.get(int(user_id))


@dataclass
class Department(db.Model):
    id: int
    name: str
    description: str
    master_name: str

    __tablename__ = 'departments'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(60), unique=True)
    description = db.Column(db.String(200))
    master_name = db.Column(db.String(80))
    employees = db.relationship('Object', backref='department',
                                lazy='dynamic')

    def __repr__(self):
        return '<Department: {}>'.format(self.name)


@dataclass
class Role(db.Model):
    id: int
    name: str
    description: str
    value: int
    multiple: bool
    parent_id: int
    __tablename__ = 'roles'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(60), unique=True)
    description = db.Column(db.String(200))
    value = db.Column(db.Integer)
    multiple = db.Column(db.Boolean, default=1)
    employees = db.relationship('Object', backref='role',
                                lazy='dynamic')
    parent_id = db.Column(db.Integer, db.ForeignKey('roles_parent.id'))
    parent = db.relationship('RoleParent', back_populates='roles')

    def __repr__(self):
        return '<Role: {}>'.format(self.name)


class RoleUser(db.Model):
    __tablename__ = 'roleuser_junction'

    relationid = db.Column(db.Integer, primary_key=True)
    userid = db.Column(db.Integer)
    roleid = db.Column(db.Integer)
    value = db.Column(db.Integer)
    addedby = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=True)

    def __repr__(self):
        return '<User/Role: {}>'.format(self.relationid)


class PermissionUser(db.Model):
    __tablename__ = 'permissionuser_junction'

    relationid = db.Column(db.Integer, primary_key=True)
    userid = db.Column(db.Integer)
    permissionid = db.Column(db.Integer)

    def __repr__(self):
        return '<User/Permission: {}>'.format(self.relationid)


class Note(db.Model):
    __tablename__ = 'notes'

    id = db.Column(db.Integer, primary_key=True)
    body = db.Column(db.String(255))
    value = db.Column(db.Integer)
    user_id = db.Column(db.Integer, db.ForeignKey('objects.id'))
    user = db.relationship('Object', back_populates='notes')

    def __repr__(self):
        return '<Note: {}>'.format(self.title)


@dataclass
class Info(db.Model):
    id: int
    type: str
    description: str
    time: str
    uid: str
    __tablename__ = 'infos'

    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(30))
    description = db.Column(db.String(200))
    time = db.Column(db.DateTime(), default=db.func.now())
    uid = db.Column(db.Integer, db.ForeignKey('employees.id'))

    def __repr__(self):
        return '<Info: {}>'.format(self.type)


class Log(db.Model):
    __tablename__ = 'logs'

    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(30))
    user = db.Column(db.Integer)
    comment = db.Column(db.String(120))
    time = db.Column(db.DateTime(), default=db.func.now())

    def __repr__(self):
        return '<Log: {}>'.format(self.type)


@dataclass
class RoleParent(db.Model):
    id: int
    name: str
    color: str
    emoji: str
    __tablename__ = 'roles_parent'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(60), unique=True)
    color = db.Column(db.String(60))
    emoji = db.Column(db.String(30))
    roles = db.relationship("Role", back_populates="parent")


    def __repr__(self):
        return '<Role: {}>'.format(self.name)


class Setting(db.Model):
    __tablename__ = 'settings'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(60), unique=True)
    value = db.Column(db.String(200))

    def __repr__(self):
        return '<Setting: {}>'.format(self.name)


class PersonalSettingOverride(db.Model):
    __tablename__ = 'personalsettings'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(60))
    value = db.Column(db.String(200))
    user_id = db.Column(db.Integer, db.ForeignKey("employees.id"))
    user = db.relationship("Employee", back_populates="user_settings")

    def __repr__(self):
        return '<Setting: {}>'.format(self.name)

