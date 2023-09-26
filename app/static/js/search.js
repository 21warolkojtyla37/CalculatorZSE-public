function filter(i, v, data) {
    let $t = $(data);
    for (var d = 0; d < i; ++d) {
        if ($t.is(":contains('" + data[d] + "')")) {
            return true;
        }
    }
    return false;
}

 $("#departs").change(function () {
        let v = this.value;
        let i = $('#employees tr').length;
        let data = $('#employees tr')
        filter(i, v, data)
 });