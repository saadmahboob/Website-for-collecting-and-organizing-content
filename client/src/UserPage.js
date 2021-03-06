import React, { Component } from 'react';
import { Link } from 'react-router'
import request from 'superagent';
import Note from './Note';
import NavigationBar from './NavigationBar'
import SearchBar from './SearchBar'


var UserPage = React.createClass({
  getInitialState() {
      return {
          notes: [''], filterText: '', tagset: ['']
      }
  },
  componentDidMount() {
    var self = this;
    var tags = []
    request
     .get('/api/userpage/'+this.props.routeParams.userId)
     .set('Accept', 'application/json')
     .end(function(err, res) {
       if (err || !res.ok) {
         console.log('Oh no! error', err);
       }
       else {
         tags = res.body.userTags;
         self.setState({tagset: tags})
       }
       if(tags.length){
         console.log('Going to print tags')
         var addnotes = []
         tags.forEach((tag) => {
           console.log(tag)
           request
            .get('/api/tagsearch/'+tag)
            .set('Accept', 'application/json')
            .end(function(err, res) {
              if (err || !res.ok) {
                console.log('Oh no! error', err);
              }
              else {
                addnotes.push.apply(addnotes, res.body.tagPosts)
              }
              function mycomparator(a,b) {
                  var some1 = []
                  var some2 = []
                  some1.push.apply(some1,a.postLike)
                  some2.push.apply(some2,b.postLike)
                  return parseInt(some2.length, 10) - parseInt(some1.length, 10);
                }
              addnotes.sort(mycomparator);
              self.setState({notes: addnotes});
            });
         });
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
                    userId={this.props.routeParams.userId}
                    flag={false}>
                {note.postPic}
              </Note>)
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
  render(){
    console.log(this.state.notes)
    var myfeedlink = "/user/"+this.props.routeParams.userId
    var mypostslink = "/myposts/"+this.props.routeParams.userId
    var explorelink = "/explore/"+this.props.routeParams.userId
    var addcontentlink = "/add/"+this.props.routeParams.userId
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
    return(
      <div>
      <NavigationBar
          explorelink={explorelink}
          myfeedlink={myfeedlink}
          mypostslink={mypostslink}
          addcontentlink={addcontentlink}
          activepagename = {"Home"}
          username = {this.props.routeParams.userId}/>
      <br/>
      <SearchBar
        filterText={this.state.filterText}
        onUserInput={this.handleUserInput}
      />
      <br />
      <div className="tag-span">
      {this.state.tagset.map((tag) =>
        <span className="pricetag" onClick={() => this.filter(tag)}>{tag}
        <span> </span>
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

export default UserPage;
