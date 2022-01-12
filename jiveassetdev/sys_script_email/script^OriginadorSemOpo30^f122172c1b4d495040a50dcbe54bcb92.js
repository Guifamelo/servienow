(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {

    // Add your code here

    // Puxa os registros dos ultimos 30 dias (agrupados por originador)  
    var grOpo = new GlideAggregate('x_jam_special_oppo_oportunidades_claims');
    grOpo.addEncodedQuery('sys_class_name=x_jam_special_oppo_oportunidades_claims^sys_created_onRELATIVEGT@dayofweek@ago@30^u_originadorISNOTEMPTY');
    grOpo.groupBy('u_originador');
    grOpo.query();
    var criaramOpo = []; //glideAgregate
    while (grOpo.next()) {
        criaramOpo.push(grOpo.getDisplayValue('u_originador'));
    }
    //  gs.info(log);

    // Puxa os users de title=Originadores criados nos ultimos 30dias
    var grUser = new GlideRecord('sys_user');
    grUser.addEncodedQuery('sys_created_onRELATIVEGT@dayofweek@ago@30');
    grUser.addQuery('title', 'Originador PPV');
    grUser.query();

    var novosUser = [];
    while (grUser.next()) {
        novosUser.push(grUser.getDisplayValue());
    }
    // gs.info(log2);
    // Compara quem da 2a array nao esta na 1a, ou seja, qual dos novos users nao gerou registro nos ultimos 30dias  
    var semOpo = [];
    var arr = new ArrayUtil();
    semOpo = arr.diff(novosUser, criaramOpo);
    // Mostra quem nao criou registro.
    //gs.info('Os originadores que ainda nao inseriram OPO sao: ' + semOpo);
    //   for (var x = 0; x < semOpo.length; x++) {
    //    template.print('Nome: '+ semOpo);
    //    }
    //template.print("semOpo");
//	template.print('<span style="color: #006032; font-family: arial, helvetica, sans-serif;font-size: 14px;">'+ semOpo +'</span>');
	template.print("mensagem!");



})(current, template, email, email_action, event);