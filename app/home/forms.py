from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, ValidationError, TextAreaField
from wtforms.validators import DataRequired

from ..models import Info

class BugForm(FlaskForm):
    description = TextAreaField('Podaj błąd', validators=[DataRequired()])
    submit = SubmitField('Wyślij')