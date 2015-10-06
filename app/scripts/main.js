_.templateSettings = {
  interpolate: /<%=([\s\S]+?)%>/g,
  evaluate: /<%([\s\S]+?)%>/g
};
const API_ROOT = 'https://minesweeper-api.herokuapp.com/';



//ROUTER

var Router = Backbone.Router.extend({
  routes: {
    "": "index",
    "game/:id": "showGame",
  },

  index: function() {
    var indexView = new IndexView();
    $('main').html(indexView.render());
    console.log('index function ran')
  },

  showGame: function(gameId) {
    console.log('showGame function began');
    var game = new Game({
      id: gameId
    });
    var gameView = new GameView({
      model: game,
    });
    $('main').html(gameView.render());
  }
});

$(document).ready(function() {
  var router = new Router();
  Backbone.history.start();
});


//MODELS

var Game = Backbone.Model.extend({
  get urlRoot() {
    return API_ROOT + 'games';
    console.log('returned url')
  },
  defaults: {
    mines: 0,
    state: 'new'
  }
});


//VIEWS

var IndexView = Backbone.View.extend({
  template: $('#createTemplate').text(),

  events: {
    'change #diffSelect': 'createGame'

    // $('#content').html(gameView.render())
  },

  createGame: function(event) {
    var diff = event.target.value;
    console.log('game created');
    var game = new Game({
      difficulty: diff
    });
    game.save().then(function() {
      Backbone.history.navigate(`/game/${game.get('id')}`, true);
    });

  },

  render: function() {
    this.$el.html(this.template);
    console.log('template rendered');
    return this.el;

  }
});

var GameView = Backbone.View.extend({
  template: _.template($('#gameTemplate').html()),

  render: function() {
    var gameTemplate = this.template(this.model.toJSON());
    this.$el.html(gameTemplate);
    var $table = $('table.game', this.$el);
    _.each(this.model.get('board'), function(row, y) {
      var $tr = $('<tr>');
      _.each(row, function(col, x) {
        var $td = $('<td>');
        $td.data('x', x);
        $td.data('y', y);
        switch (col) {
          case ' ':
            $td.addClass('unrevealed');
            break;
          case '_':
            $td.addClass('revealed');
            break;
          case 'F':
            $td.addClass('flagged');
            break;
          case '*':
            $td.addClass('mine');
            break;
          default:
            $td.text(col);

        }

        $tr.append($td);
      })
      $table.append($tr);
    });
    return this.el;
    console.log('rendered gameboard')
  },

  initialize: function() {
    this.listenTo(this.model, 'change', this.render);
    this.model.fetch();
  }
});
