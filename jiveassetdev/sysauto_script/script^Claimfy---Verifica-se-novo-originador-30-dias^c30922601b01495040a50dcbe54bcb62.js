function run() {
    // Puxa todos os originador criados nos ultimos 30 dias
    var grUsuariosCriados = new GlideAggregate('sys_user');
    grUsuariosCriados.addEncodedQuery('sys_created_onRELATIVEGT@dayofweek@ago@30^title=Originador PPV^u_grupo_principalISNOTEMPTY');
    grUsuariosCriados.groupBy('u_grupo_principal');
    grUsuariosCriados.query();

    var arrayUsuariosCriados = [];
    var arrayUsuariosQueInseriram = [];
    while (grUsuariosCriados.next()) {
        arrayUsuariosCriados.push(grUsuariosCriados.getValue('u_grupo_principal'));
    }
    //gs.info(arrayUsuariosCriados);

    // Verifica se esses originadores inseriram oportunidade
    for (var i in arrayUsuariosCriados) {
        var originador = arrayUsuariosCriados[i];

        var grOpoc = new GlideRecord('x_jam_special_oppo_oportunidades_claims');
        grOpoc.addEncodedQuery('sys_class_name=x_jam_special_oppo_oportunidades_claims^u_originador.sys_id=' + originador);
        grOpoc.query();
        if (grOpoc.hasNext()) {
            arrayUsuariosQueInseriram.push(originador);
        }
    }

    // Compara as duas arrays  
    var semOpo = [];
    var arr = new global.ArrayUtil();
    semOpo = arr.diff(arrayUsuariosCriados, arrayUsuariosQueInseriram);

    //gs.info(semOpo);

    // Percorre o grupo para enviar a notification aos membros
    var grOriginadores = [];
    for (var z in semOpo) {
        var grGrupo = new GlideRecord('sys_user_grmember');
        grGrupo.addEncodedQuery('group=' + semOpo[z]);
        grGrupo.query();
        if (grGrupo.next()) {
            grOriginadores.push(grGrupo.user.sys_id.toString());
        }
    }
    gs.eventQueue('x_jam_special_oppo.user_nao_criou_opo_30', grGrupo, grOriginadores, null);
}
run();