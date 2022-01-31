var API_AssinaWebClaimfy = Class.create();
API_AssinaWebClaimfy.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    getAnexos: function(u_tipo_documento, parent) {
        // Validar os anexos para enviar para assinatura tem existir um termo de cessão
        var grAnexoTask = new GlideRecord('x_jam_special_oppo_anexos_claim');
        grAnexoTask.addEncodedQuery('parent=' + parent + '^u_tipo_documento=' + u_tipo_documento);
        grAnexoTask.query();
        var sysIDTask = grAnexoTask.next() ? grAnexoTask.getUniqueValue() : '';

        var grAnexo = new GlideRecord('sys_attachment'); //Pega a quantidade de anexos
        grAnexo.get('table_sys_id', sysIDTask);

        var qtdAnexos = grAnexo.getRowCount();
		
		return qtdAnexos;
    },
    enviar: function() {
        var sysId = this.getParameter('sysId');
        var current = new GlideRecord('x_jam_special_oppo_tarefas_de_oportunidades_claim');
        current.get(sysId);

        var responsavel = current.assigned_to;
        var procuracao = current.u_nome_contrato;
        var data = new GlideDateTime();

        //Verificar se o resposavel e o nome do doc estão preenchidos
        if (responsavel == '') {
            gs.addErrorMessage("Favor adicionar um responsavel a tarefa!");
        } else if (procuracao == '') {
            gs.addErrorMessage('Para prosseguir é necessário informar o nome da Procuração!');
        } else {
            //Busca na tabela de signatario os assinadores vinculados a tarefa
            var grSignatario = new GlideRecord('x_jam_special_oppo_m2m_tarefa_de_op_signatarios');
            grSignatario.addQuery('tarefa_de_oportunidade', '=', current.getUniqueValue());
            grSignatario.query();

            if (grSignatario.hasNext()) {
                if (grSignatario.next()) {
                    var email = grSignatario.u_email;
                    var tel = grSignatario.u_telefone;
                    var modeloAssinatura = grSignatario.u_modelo_assinatura;
                    var perfilAssinatura = grSignatario.u_perfil_assinatura;
                    var testemunha = grSignatario.u_testemunha;

                    if (email == '') {
                        gs.addErrorMessage("Para prosseguir é necessário preencher o email do signatário!");
                    } else if (tel == '') {
                        gs.addErrorMessage("Para prosseguir é necessário preencher o telefone do signatário");
                    } else if (modeloAssinatura == '') {
                        gs.addErrorMessage("Para prosseguir é necessário preencher o modelo de assinatura do signatário");
                    } else if (perfilAssinatura == '') {
                        gs.addErrorMessage("Para prosseguir é necessário preencher o perfil da assinatura do signatário");
                    } else if (testemunha == '') {
                        gs.addErrorMessage("Para prosseguir é necessário preencher se o signatário assina como testemunha!");
                    }
                }
                var termoDeCessao = false;
                var contratoDeCessao = false;
                var procuracaoPublica = false;
				
                // Validar os anexos para enviar para assinatura tem existir um termo de cessão
                var qtdAnexos = this.getAnexos('termo_cessao', current.getValue('parent'));

                if (qtdAnexos == 1) {
                    termoDeCessao = true;
                } else if (qtdAnexos > 1) {
                    gs.addErrorMessage("Favor anexar apenas UM Termo de Cessão para ser assinado!");
                } else {
                    gs.addErrorMessage("Favor anexar o Termo de Cessão para ser assinado!");
                }

                // Validar os anexos para enviar para assinatura tem existir um contrato de cessão
                qtdAnexos = this.getAnexos('contrato_cessao', current.getValue('parent'));
                
                if (qtdAnexos == 1) {
                    contratoDeCessao = true;
                } else if (qtdAnexos > 1) {
                    gs.addErrorMessage("Favor anexar apenas UM Contrato de Cessão para ser assinado!");
                } else {
                    gs.addErrorMessage("Favor anexar o Contrato de Cessão para ser assinado!");
                }

                // Validar os anexos para enviar para assinatura tem existir uma procuração publica
                qtdAnexos = this.getAnexos('procuracao_publica_assinatura_eletronica', current.getValue('parent'));

                if (qtdAnexos == 1) {
                    procuracaoPublica = true;
                } else {
                    gs.addErrorMessage("Favor anexar a Procuração Publica assinada, para seguir com a Assinatura eletrônica/digital");
                }

                if (termoDeCessao && contratoDeCessao && procuracaoPublica) {
                    this.enviarParaAssinatura(data, current, 'termo_cessao');
                    this.enviarParaAssinatura(data, current, 'contrato_cessao');
                }

            } else {
                gs.addErrorMessage("Para prosseguir é necessário adicionar ao menos um signatário!");
            }
        }
    },
    enviar2: function() {
        var sysId = this.getParameter('sysId');
        var current = new GlideRecord('x_jam_special_oppo_tarefas_de_oportunidades_claim');
        current.get(sysId);
        var responsavel = current.assigned_to;
        var procuracao = current.u_nome_da_procuracao;
        var data = new GlideDateTime();

        //Verificar se o resposavel e o nome do doc estão preenchidos
        if (responsavel == '') {
            gs.addErrorMessage("Favor adicionar um responsavel a tarefa!");
        } else if (procuracao == '') {
            gs.addErrorMessage('Para prosseguir é necessário informar o nome da Procuração!');
        } else {

            //Busca na tabela de signatario os assinadores vinculados a tarefa
            var grSignatario = new GlideRecord('x_jam_special_oppo_m2m_tarefa_de_op_signatarios');
            grSignatario.addQuery('tarefa_de_oportunidade', '=', current.getUniqueValue());
            grSignatario.query();

            if (grSignatario.hasNext()) {
                if (grSignatario.next()) {
                    var email = grSignatario.u_email;
                    var tel = grSignatario.u_telefone;
                    var modeloAssinatura = grSignatario.u_modelo_assinatura;
                    var perfilAssinatura = grSignatario.u_perfil_assinatura;
                    var testemunha = grSignatario.u_testemunha;

                    if (email == '') {
                        gs.addErrorMessage("Para prosseguir é necessário preencher o email do signatário!");
                    } else if (tel == '') {
                        gs.addErrorMessage("Para prosseguir é necessário preencher o telefone do signatário");
                    } else if (modeloAssinatura == '') {
                        gs.addErrorMessage("Para prosseguir é necessário preencher o modelo de assinatura do signatário");
                    } else if (perfilAssinatura == '') {
                        gs.addErrorMessage("Para prosseguir é necessário preencher o perfil da assinatura do signatário");
                    } else if (testemunha == '') {
                        gs.addErrorMessage("Para prosseguir é necessário preencher se o signatário assina como testemunha!");
                    }
                }
                // Validar os anexos para enviar para assinatura tem existir um anexos
                var grAnexoTask = new GlideRecord('x_jam_special_oppo_anexos_claim');
                grAnexoTask.addQuery('parent', '=', current.parent);
                grAnexoTask.addQuery('u_tipo_documento', '=', 'procuracao_substituicao_processual');
                grAnexoTask.query();

                if (grAnexoTask.next()) {
                    var sysIDTask = grAnexoTask.getUniqueValue();
                }

                var grAnexo = new GlideRecord('sys_attachment'); //Pega a quantidade de anexos
                grAnexo.get('table_sys_id', sysIDTask);

                var qtdAnexos = grAnexo.getRowCount();

                if (qtdAnexos == 1) {
                    this.enviarParaAssinatura(data, current, 'procuracao_substituicao_processual');
                    //current.u_ativa_assinaweb = data; //Ativa a regra do assinaweb para chamar a integração;
                    //current.update();

                } else if (qtdAnexos > 1) {
                    gs.addErrorMessage("Favor anexar apenas UMA procuração para ser assinada!");
                } else {
                    gs.addErrorMessage("Favor anexar a procuração para ser assinada!");
                }
            } else {
                gs.addErrorMessage("Para prosseguir é necessário adicionar ao menos um signatário!");
            }
        }
    },
    enviarParaAssinatura: function(data, current, tipoDoc) {

        //Pega o cpf do responsavel pela tarefa.
        //var cpfUser = current.assigned_to.u_cpf_cnpj;
        var cpfUser = '00048451759831';
        if (cpfUser.startsWith("000")) {
            var cpfContaPublicador = cpfUser.replace(/000/, ''); // replace para tirar os 3 primeiros 0
        }

        // GlideRecord para pegar os dados do signatario.
        var participantes = '';
        var signatarios = [];
        var grSignatarios = new GlideRecord("x_jam_special_oppo_m2m_tarefa_de_op_signatarios");
        grSignatarios.addQuery("tarefa_de_oportunidade", current.sys_id);
        grSignatarios.query();

        while (grSignatarios.next()) {
            var CpfCnpjSignatario = grSignatarios.signatarios.u_cpf_cnpj;
            var DsNomeUsuario = grSignatarios.signatarios.u_nome;
            var DsEmail = grSignatarios.signatarios.u_email;
            var DsTelefoneContato = grSignatarios.signatarios.u_telefone;
            var tipoAssinatura = grSignatarios.signatarios.u_modelo_assinatura;
            var perfilAssinador = grSignatarios.signatarios.u_perfil_assinatura;
            var testemunha = grSignatarios.signatarios.u_testemunha;
            var tituloAssinador = '';

            if (testemunha == 'sim') {
                tituloAssinador = 'Testemunha';
            }

            if (DsTelefoneContato) {
                DsTelefoneContato = DsTelefoneContato.replace(/[^0-9]+/g, '');
                if (DsTelefoneContato.length > 11) {
                    DsTelefoneContato = DsTelefoneContato.slice(2, 14);
                }
            }
            participantes +=
                '<participante>' +
                '<CpfCnpj>' + CpfCnpjSignatario + '</CpfCnpj>' +
                '<DsNome>' + DsNomeUsuario + '</DsNome>' +
                '<DsEmail>' + DsEmail + '</DsEmail>' +
                '<DsTelefoneContato>' + DsTelefoneContato + '</DsTelefoneContato>' +
                '<TpAssinatura>' + tipoAssinatura + '</TpAssinatura>' +
                '<Perfil>' + perfilAssinador + '</Perfil>' +
                '<DsAliasPerfil>' + tituloAssinador + '</DsAliasPerfil>' +
                '</participante>';
        }

        //GlideRecord para percorrer a lista de anexos e pegar o sys_id do contrato
        var grContrato = new GlideRecord('x_jam_special_oppo_anexos_claim');
        grContrato.addEncodedQuery('parent=' + current.parent + '^u_tipo_documento=' + tipoDoc);
        grContrato.query();
        grContrato.next();
        var sysID = grContrato.getUniqueValue();

        // Armazenamento de informações sobre o documento.
        var nomeProcuracao = tipoDoc == 'procuracao_substituicao_processual' ? current.u_nome_da_procuracao : grContrato.u_tipo_documento.getDisplayValue() + ' ' + current.parent.u_caso.getDisplayValue();
        var detalhesDocumento = "Documento: " + current.getDisplayValue('number') + ", enviado em " + current.getDisplayValue('data_da_conclusao');
        var gdt = new GlideDateTime();
        gdt.addDaysUTC(7);
        var dataLimiteAssinatura = gdt;
        var emailEventos = 'S';
        var marcaDagua = 'S';

        //Buscar base64 do anexo da solicitação.
        var grAnexo = new GlideRecord('sys_attachment');
        grAnexo.addQuery('table_sys_id', '=', sysID);
        grAnexo.query();

        if (grAnexo.next()) {
            var sa = new GlideSysAttachment();
            var encData = sa.getContentBase64(grAnexo);

            var inputStream = sa.getContentStream(grAnexo.sys_id);
            var digest = new GlideDigest();
            var md5Documento = digest.getMD5HexFromInputStream(inputStream);
        }

        // Estrutura do XML para envio dos dados para o assinaweb
        var xmlString =
            '<?xml version="1.0" encoding="utf-8"?>' +
            '<AssinaWeb VersaoDados="3.00">' +
            '<TpAmbiente>P</TpAmbiente>' +
            '<CpfCnpjPublicador>' + cpfContaPublicador + '</CpfCnpjPublicador>' +
            '<ContaPublicacao>1381</ContaPublicacao>' +
            '<IdChaveAcesso>ve9YKY4P5BM0VfCxuhuiYCOMDC1Oo6DUF3A4Dib6aTGSoz79KndfRDJ327erQcuN</IdChaveAcesso>' +
            '<documento>' +
            '<DsDocumento>' + nomeProcuracao + '</DsDocumento>' +
            '<DsDetalhesDocumento>' + detalhesDocumento + '</DsDetalhesDocumento>' +
            '<DtLimiteAssinatura>' + dataLimiteAssinatura + '</DtLimiteAssinatura>' +
            '<InEmailEventos>' + emailEventos + '</InEmailEventos>' +
            '<InMarcaDagua>P</InMarcaDagua>' +
            '<LateralMarcaDagua>1</LateralMarcaDagua>' +
            '<MD5Documento>' + md5Documento + '</MD5Documento>' +
            '<participantes>' +
            participantes +
            '</participantes>' +
            '</documento>' +
            '</AssinaWeb>';

        var xmlDoc = new XMLDocument2();
        xmlDoc.parseXML(xmlString);

        try {
            var s = new sn_ws.SOAPMessageV2(
                "x_jam_ges_doc_jur.IntegracaoAssinaWeb",
                "PublicacaoDocumentosSoap.PublicarDocumento"
            );
            s.setStringParameter("PublicarDocumento.pdfBase64", encData);
            s.setStringParameter("PublicarDocumento.XmlDocumento", xmlDoc);

            var response = s.executeAsync();
            var responseBody = response.getBody();
            var status = response.getStatusCode();

            // Interpreta XML e guarda os nós em variáveis
            var sendResponse = gs.xmlToJSON(responseBody);
            var retorno = sendResponse["soap:Envelope"]["soap:Body"]["PublicarDocumentoResponse"]["PublicarDocumentoResult"]["AssinaWeb"]["publicacao"]["retorno"];
            var mensagem = sendResponse["soap:Envelope"]["soap:Body"]["PublicarDocumentoResponse"]["PublicarDocumentoResult"]["AssinaWeb"]["publicacao"]["mensagem"];
            var idDocumento = sendResponse["soap:Envelope"]["soap:Body"]["PublicarDocumentoResponse"]["PublicarDocumentoResult"]["AssinaWeb"]["publicacao"]["idDocumento"];
            gs.info("ASSINA WEB RESPONSE BODY " + responseBody);
            if (retorno == '0') {

                var grIdAssinatura = new GlideRecord('u_assinatura_ppv');
                grIdAssinatura.initialize();
                grIdAssinatura.u_atividade = current.getUniqueValue();
                grIdAssinatura.u_id_assinaweb = idDocumento;
                grIdAssinatura.u_oportunidade = current.parent;
                grIdAssinatura.u_nome_contrato = nomeProcuracao;
                grIdAssinatura.u_tipo_doc = tipoDoc;
                grIdAssinatura.insert();

                gs.addInfoMessage("Documento Publicado com sucesso!");
                current.work_notes = 'Documento Publicado com sucesso!\nID AssinaWeb ' + idDocumento;
                current.state = '500'; // Aguardando Assinatura
                current.u_ativa_assinaweb = data;
                current.update();
            }

        } catch (ex) {
            var message = ex.getMessage();
            if (message == 'undefined') {
                gs.addErrorMessage("Erro: " + message);
            }
        }
    },
    getStatus: function(idDocumento) {
        var contador = 0;
        var motivoJoin;
        var tipoDoc = [];
        var tipoDeDoc;
        var nomesArr = [];
        var statusArr = [];
        var motivosDict = {};
        var retornoObj = {};
        var countApr = 0;
        var countRec = 0;

        // XML para passar os parametros para fazer a chamada. 
        var xml =
            '<?xml version="1.0" encoding="utf-8"?>' +
            '<AssinaWeb VersaoDados="3.00">' +
            '<TpAmbiente>P</TpAmbiente>' +
            '<IdChaveAcesso>ve9YKY4P5BM0VfCxuhuiYCOMDC1Oo6DUF3A4Dib6aTGSoz79KndfRDJ327erQcuN</IdChaveAcesso>' +
            '<documento>' +
            '<IdDocumento>' + idDocumento + '</IdDocumento>' +
            '</documento>' +
            '</AssinaWeb>';
        var xmlDoc = new XMLDocument2();
        xmlDoc.parseXML(xml);

        //Chamada para verificar o status do documento
        try {
            var a = new sn_ws.SOAPMessageV2('x_jam_ges_doc_jur.IntegracaoAssinaWeb', 'PublicacaoDocumentosSoap.VerificarDocumento');
            a.setStringParameter("VerificarDocumento.XmlString", xmlDoc);

            var responseA = a.executeAsync();
            var responseBodyA = responseA.getBody();
            var statusA = responseA.getStatusCode();
            var sendResponse = gs.xmlToJSON(responseBodyA);

            var retorno = sendResponse["soap:Envelope"]["soap:Body"]["VerificarDocumentoResponse"]["VerificarDocumentoResult"]["AssinaWeb"]["documento"]["statusDoc"];
            var signatarios = sendResponse["soap:Envelope"]["soap:Body"]["VerificarDocumentoResponse"]["VerificarDocumentoResult"]["AssinaWeb"]["documento"]["signatarios"]["signatario"];
            //gs.addInfoMessage(JSON.stringify(sendResponse));

            var mensagem = [];
            var count = 0;
            if (signatarios.length > 0) {
                for (var i = 0; i < signatarios.length; i++) {
                    var statusAss = signatarios[i].inStatusAssinatura;
                    var motivoDev = signatarios[i].Justificativa;
                    var nome = signatarios[i].Nome;
                    nomesArr.push(nome);
                    statusArr.push(statusAss);

                    if (statusAss == 'R') {
                        motivosDict[nome] = motivoDev;
                    }
                    var status = statusAss == 'R' ? 'recusado, ' + motivoDev : statusAss == 'P' ? 'pendente' : statusAss == 'A' ? 'aprovado' : 'erro';
                    mensagem.push(' ' + nome + ' = ' + status);
                }
            } else {
                statusAss = signatarios.inStatusAssinatura;
                motivoDev = signatarios.Justificativa;
                nome = signatarios.Nome;

                nomesArr.push(nome);
                statusArr.push(statusAss);

                if (statusAss == 'R') {
                    motivosDict[nome] = motivoDev;
                }
                status = statusAss == 'R' ? 'recusou pelo Motivo: ' + motivoDev : statusAss == 'P' ? 'pendente' : statusAss == 'A' ? 'aprovou' : 'erro';
                mensagem.push(' ' + nome + ' ' + status);
            }
            for (var j = 0; j < nomesArr.length; j++) {
                if (statusArr[j] == 'A')
                    countApr++;
                if (statusArr[j] == 'R')
                    countRec++;
            }

            gs.addInfoMessage((countApr == nomesArr.length));

            if (countRec > 0) {
                retornoObj['status'] = 'recusado';
                retornoObj['mensagem'] = mensagem;
            } else if (countApr == nomesArr.length) {
                retornoObj['status'] = 'aprovado';
            } else {
                retornoObj['status'] = 'pendente';
                return retornoObj;
            }
            return retornoObj;
        } catch (exa) {
            var messageA = exa.message;
            gs.addErrorMessage(messageA);
        }
    },
    type: 'API_AssinaWebClaimfy'
});