
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, BooleanField, IntegerField, SelectMultipleField
from wtforms.validators import DataRequired, Email, EqualTo
from wtforms.widgets import ColorInput
from wtforms_sqlalchemy.fields import QuerySelectField

from ..models import Department, Role, Employee, Object, Setting

class DepartmentForm(FlaskForm):
    name = StringField('Nazwa', validators=[DataRequired()])
    description = StringField('Opis', validators=[DataRequired()])
    submit = SubmitField('Wyślij')
    
class RoleForm(FlaskForm):
    name = StringField('Nazwa', validators=[DataRequired()])
    description = StringField('Opis')
    value = IntegerField('Wartość', validators=[DataRequired()])
    color = StringField(widget=ColorInput())
    submit = SubmitField('Wyślij')
           
class EmployeeForm(FlaskForm):
    email = StringField("E-mail użytkownika: ", default=lambda: Employee.query.all(), validators=[DataRequired(), Email()])
    first_name = StringField("Imię użytkownika: ", default=lambda: Employee.query.all(), validators=[DataRequired()])
    last_name = StringField("Nazwisko użytkownika: ", default=lambda: Employee.query.all(), validators=[DataRequired()])
    superadmin = BooleanField("Czy może edytować wszystkich administratorów", default=lambda:
                         Employee.query.all(), validators=[DataRequired()])
    submit = SubmitField('Wyślij')
    
class EmployeeAddPermForm(FlaskForm):
    department = QuerySelectField("Który dodać?", query_factory=lambda: Department.query.all(), get_label="name")
    submit = SubmitField('Wyślij')

class ObjectForm(FlaskForm):
    first_name = StringField("Imię użytkownika: ", default=lambda: Object.query.all(), validators=[DataRequired()])
    last_name = StringField("Nazwisko użytkownika: ", default=lambda: Object.query.all(), validators=[DataRequired()])
    comment = StringField("Komentarz: ", default=lambda: Object.query.all())
    department = QuerySelectField(query_factory=lambda: Department.query.all(), get_label="name")

    submit = SubmitField('Wyślij')
    
class NewObjectForm(FlaskForm):
    first_name = StringField("Imię użytkownika: ", validators=[DataRequired()])
    last_name = StringField("Nazwisko użytkownika: ", validators=[DataRequired()])
    comment = StringField("Komentarz: ")
    department = QuerySelectField(query_factory=lambda: Department.query.all(), get_label="name")

    submit = SubmitField('Wyślij')

class TraitAssignForm(FlaskForm):
    role = QuerySelectField(query_factory=lambda: Role.query.all(),
                            get_label=("name"))
    submit = SubmitField('Zapisz i wróć')
    more = SubmitField('Dodaj więcej')
    exit = SubmitField('Wróć bez zapisywania obecnego')

class SettingForm(FlaskForm):
    ver_two = BooleanField("Czy użyć wersji drugiej?", default= lambda: Setting.query.filter_by(name='is_dynamic').first().value)
    submit = SubmitField('Wyślij')