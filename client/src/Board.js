import React, { Component } from 'react';
import { Link } from 'react-router'
import request from 'superagent';
import Note from './Note';
import NavigationBar from './NavigationBar'
import SearchBar from './SearchBar'



var Board = React.createClass({
    getInitialState() {
        return {
            notes: [''], filterText: '', tagset: ['']
        }
    },
    componentDidMount() {
      var self = this;
      request
       .get('/api/explore')
       .set('Accept', 'application/json')
       .end(function(err, res) {
         if (err || !res.ok) {
           console.log('Oh no! error', err);
         } else {
           self.setState({notes: res.body.allposts});
         }
       });
       var self = this;
       request
        .get('/api/listtags')
        .set('Accept', 'application/json')
        .end(function(err, res) {
          if (err || !res.ok) {
            console.log('Oh no! error', err);
          } else {
            self.setState({tagset: res.body.alltags});
          }
        });
    },
    remove(id) {
        var notes = this.state.notes.filter(note => note.postId !== id)
        this.setState({notes})
    },
    like (id, likelist){
      if(likelist.includes(this.props.routeParams.userId)){
        return false;
      }
      else{
        request
          .post('/api/like/')
          .send({ postId: id, user: this.props.routeParams.userId })
          .set('Accept', 'application/json')
          .end(function(err, res){
            if (err || !res.ok) {
              alert('Oh no! error');
            } else {
              ;
            }
          });
          console.log('Will return true')
          return true;
      }
    },
    eachNote(note) {
        return (<Note key={note.postId}
                      id={note.postId}
                      post={note}
                      onRemove={this.remove}
                      onLike={this.like}
                      userId = {this.props.routeParams.userId}
                      appendtaginterests={this.addtagstouser}
                      flag={true}>
                    {note.postPic}
                </Note>
                )
    },
    addtagstouser(addtags1){
      var addtags = []
      addtags.push.apply(addtags,addtags1)
      console.log('Will append ',addtags,'to ',this.props.routeParams.userId)
      request
        .post('/api/appendtags/')
        .send({ tags: addtags1, user: this.props.routeParams.userId })
        .set('Accept', 'application/json')
        .end(function(err, res){
          if (err || !res.ok) {
            alert('Oh no! error');
          } else {
            ;
          }
        });
    },
    handleUserInput(filterText) {
      this.setState({
        filterText: filterText,
      });
    },
    filter(tag){
      console.log('Will filter ',tag)
      var self = this
      request
       .get('/api/tagsearch/'+tag)
       .set('Accept', 'application/json')
       .end(function(err, res) {
         if (err || !res.ok) {
           console.log('Oh no! error', err);
         }
         else {
           self.setState({notes: res.body.tagPosts})
         }
       });
    },
    render() {
      var filteredNotes = []
      this.state.notes.forEach((note) => {
        var notevar = "" + note.postTitle
        if (notevar.toLowerCase().indexOf(this.state.filterText.toLowerCase()) === -1) {
          return;
        }
        else {
          filteredNotes.push(note);
        }
      });
      var myfeedlink = "/user/"+this.props.routeParams.userId
      var mypostslink = "/myposts/"+this.props.routeParams.userId
      var explorelink = "/explore/"+this.props.routeParams.userId
      var addcontentlink = "/add/"+this.props.routeParams.userId
        return (
          <div>
          <NavigationBar
              explorelink={explorelink}
              myfeedlink={myfeedlink}
              mypostslink={mypostslink}
              addcontentlink={addcontentlink}
              activepagename = {"Explore"}
              username = {this.props.routeParams.userId} />
          <br/>
          <SearchBar
            filterText={this.state.filterText}
            onUserInput={this.handleUserInput}
          /> <br />
          <div className="tag-span">
          {this.state.tagset.map((tag) =>
            <span className="pricetag" onClick={() => this.filter(tag.tagName)}>
              {tag.tagName} <span> </span>
            </span>
          )}
          </div>
            <div className="wrapper">
            <div className="columns">
            <div className='board'>
                   {filteredNotes.map(this.eachNote)}
            </div>
            </div>
            </div>
            </div>
        )
    }
})

export default Board;
