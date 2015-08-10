FlowRouter.route('/', {
	name: 'home',
	action: function() {
    	BlazeLayout.render('ontologies');
  	}
});

FlowRouter.route('/tab', {
	name: 'tab',
	action: function() {
    	BlazeLayout.render('tab');
  	}
});

FlowRouter.route('/tools/:lg/:_id/origin/:origin', {
	name: 'tools',
	action: function() {
    	BlazeLayout.render('tools');
  	}
});

FlowRouter.route('/dropt', {
	name: 'droptest',
	action: function() {
    	BlazeLayout.render('droptest');
  	}
});