(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {         
	
	var grMembro = new GlideRecord('sys_user_grmember');
	grMembro.addQuery('group','6709d0f61bbcc51089f687bfe54bcb18'); // sys_id do grupo Onboarding-Claimfy
	grMembro.query();
	
	while (grMembro.next()) {
                email.addAddress("cc",grMembro.user.email.toString(),"Onboarding-Claimfy"); 
	}
	
})(current, template, email, email_action, event);