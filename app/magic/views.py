from flask import abort, render_template, Response
import xlsxwriter
from . import magic
from .. import db
from ..models import Department, Employee, Role, RoleUser, PermissionUser, Object
from flask_login import current_user, login_required
import io
import numpy as np
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from matplotlib.figure import Figure
import matplotlib 
import matplotlib.pyplot as plt

@magic.route('a')
@login_required
def homepage():
    return render_template('magic/view.html', title='Tajne rzeczy')

@magic.route('b')
@login_required
def worksheet():
    workbook = xlsxwriter.Workbook('Expenses01.xlsx')
    worksheet = workbook.add_worksheet()

    employees = Object.query.all()
    conn = RoleUser.query.all()
    role = Role.query.all()
    departments = Department.query.all()

    row = 1
    col = 0

    worksheet.write(row, col, "Nazwa")
    worksheet.write(row, col + 1, "Opis")
    worksheet.write(row, col + 2, "Liczba osob")

    for d in departments:
        worksheet.write(row, col, d.name)
        worksheet.write(row, col + 1, d.description)
        worksheet.write(row, col + 2, d.employees.count())
        row += 1

    workbook.close()
    return render_template('magic/view.html', title='Arkusze')

@magic.route('c&<int:id>')
@login_required
def worksheet2(id):
    workbook = xlsxwriter.Workbook('Expenses01.xlsx')
    worksheet = workbook.add_worksheet()

    employees = Object.query.filter_by(department_id=id).all()
    conn = RoleUser.query.all()
    role = Role.query.all()

    row = 1
    col = 0
    s = 0

    worksheet.write(row - 1, col, "Nazwa")
    worksheet.write(row - 1, col + 1, "Opis")
    worksheet.write(row - 1, col + 2, "Liczba osob")

    for e in employees:
        worksheet.write(row, col, (e.first_name + e.last_name))
        worksheet.write(row, col + 1, e.comment)
        col += 2
        for c in conn:
            if e.id == c.userid:
                for r in role:
                    if c.roleid == r.id:
                        worksheet.write(row, col + s, r.value)
                        col += 1
        row += 1
        col = 0

    workbook.close()
    return render_template('magic/view.html', title='Wyświetl')

@magic.route('d')
@login_required
def history():
    pass

@magic.route('e/<string:data1>/<string:title>/')
@login_required
def plot(data1, title):
    if data1 == "studentsByDep":
        employees = Object.query.all()
        conn = RoleUser.query.all()
        role = Role.query.all()
        did = []
        die = []
        departments = Department.query.all()

        if current_user.is_admin:
            for dp in departments:
                did.append(dp.name)
                u = 0
                for employee in employees:
                    if employee.department_id == dp.id:
                        u = u + 1
                die.append(u)

        labels = did
        means = die
        
    elif data1 == "bestStudents":
        employees = Object.query.all()
        conn = RoleUser.query.all()
        role = Role.query.all()
        did = []
        die = []
        
        if current_user.is_admin:
            for st in employees:
                did.append(st.first_name)
                u = 0
                for r in conn:
                    if r.userid == st.id:
                        for rl in role:
                            if r.roleid == rl.id:
                                u = u + (rl.value)
                die.append(u)
                
        print(die)
    
        newdid = []
        newdie = []
        
        for i in range(5):
            x = did.index(max(did))
            print(x)
            max_value = die[x]
            max_name = did[x]
            newdid.append(max_name)
            newdie.append(max_value)
            did.pop(x)
            die.pop(x)
            
        labels = newdid
        means = newdie
    
    else:
        abort(404)

    x = np.arange(len(labels))
    width = 1

    fig, ax = plt.subplots()
    rects1 = ax.bar(x - width, means, width / 2, label='dd')

    ax.set_ylabel('Scores')
    ax.set_title(title)
    ax.set_xticks(x)
    ax.set_xticklabels(labels)
    ax.legend()


    def autolabel(rects):
        """Attach a text label above each bar in *rects*, displaying its height."""
        for rect in rects:
            height = rect.get_height()
            ax.annotate('{}'.format(height),
                        xy=(rect.get_x() + rect.get_width() / 2.5, height),
                        xytext=(0, 3),  
                        textcoords="offset points",
                        ha='center', va='bottom')


    autolabel(rects1)

    fig.tight_layout()
    
    output = io.BytesIO()
    FigureCanvas(fig).print_png(output)
    return Response(output.getvalue(), mimetype='image/png')
