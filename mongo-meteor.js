Values = new Mongo.Collection("values");
data = []

if (Meteor.isClient) {
  Meteor.subscribe('values');
  // This code only runs on the client
  Template.body.helpers({
    values: function () {
      return Values.find({}, { sort: { createdAt: -1 } });
    }
  });

  Template.body.events({
    "submit .new-value": function (event) {
      var v = event.target.value.value;

      Values.insert({
        percentage: parseInt(v),
        createdAt: new Date() // current time
      });

      // Clear form
      event.target.text.value = "";

      // Prevent default form submit
      return false;
    }
  });

  Template.chart.onRendered(function() {
    Meteor.subscribe("values", function(){
      var init = true;
      Values.find({}).observeChanges({
        added: function (id, fields) {
          if (!init) {
            data.push({ x: fields.createdAt.getTime(), y: fields.percentage });
            graph.render();
          }
        }
      });
      init = false;

      values = Values.find({});

      values.forEach(function(v) {
        data.push({ x: v.createdAt.getTime(), y: v.percentage });
      });

      graph = new Rickshaw.Graph({
        element: document.querySelector("#chart"),
        width: 285,
        height: 180,
        series: [{
            color: 'steelblue',
            data: data
        }]
      });

      var xAxis = new Rickshaw.Graph.Axis.Time({graph: graph});

      graph.render();
    });
  });
}

if (Meteor.isServer) {
  Meteor.publish('values', function() {
    return Values.find({});
  });
}
