
const user = require('./functions/getUserFunc')
const posts = require('./functions/getPublishedPostFunc')
const createPostPublic = require('./functions/createPostPublic')
const allPost = require('./functions/getPosts')
const createPostDraft = require('./functions/createPostDraft')

let title = ''
let content = ''

exports.handler = async(event,context)=>{

  let accessToken = event.session.user.accessToken
    console.log(event.session)
    //let accessToken = event.session.context.System.user.accessToken
//intents
  let userObj = await user(accessToken);
  let postsObj = await posts(accessToken,userObj.data.id)
  let getAllPosts = await allPost(accessToken,userObj.data.username)
  console.log(`event = ${JSON.stringify(event)}`)
  let result = {}
  if(await event.request.type === 'LaunchRequest'){
      result = {

                  "version": "1.0",
                  "response": {
                      "outputSpeech": {
                          "type": "PlainText",
                          "text": "What do you want to do next ? You can say Get user information, get all posts, create post"
                      },
                      "card": {
                          "type": "Simple",
                          "title": "Voice Blog",
                          "content": "What do you want to do next ? You can say Get user information, get all posts, create post"
                      },
                      "shouldEndSession": false
                  }

          }
      return result
  }
  else if(await event.request.type === 'IntentRequest'){
      if(event.request.intent.name === 'getUser') {

        result = {

                "version": "1.0",
                "response": {
                    "outputSpeech": {
                        "type": "PlainText",
                        "text": `Name :${userObj.data.name}`,
                    },
                    "card": {
                        "type": "Simple",
                        "title": "Voice Blog",
                        "content": `Name :${userObj.data.name}, image:${userObj.data.imageUrl}, mediumUrl:${userObj.data.name}`
                    }
                }
        }
          return result
      }else if(event.request.intent.name === 'getPublishedPost') {

      result = {

              "version": "1.0",
              "response": {
                  "outputSpeech": {
                      "type": "PlainText",
                      "text": `Name :${postsObj.data.map(obj=>{return obj.name})}`
                  },
                  "card": {
                      "type": "Simple",
                      "title": "Voice Blog",
                      "content": `Nothing`
                  }
              }

      }
        return result
    }else if(event.request.intent.name === 'getAllPosts') {
        result = {

                "version": "1.0",
                "response": {
                    "outputSpeech": {
                        "type": "SSML",
                        "ssml": `<speak>${getAllPosts.items.map(obj=>`<p>Title : ${obj.title} </p>`)}
                                  <p>you can say 'get the content for title' or end the request by saying 'stop'.</p></speak>`
                    },
                    "card": {
                        "type": "Simple",
                        "title": "Voice Blog",
                        "content": `Nothing`
                    },
                    "shouldEndSession": false
                }

        }
          return result
      }else if(event.request.intent.name === 'getContent') {
        let postTitle = event.request.intent.slots.titleContent.value
        let postInfo = getAllPosts.items.find(obj=>obj.title.toLowerCase() == postTitle.toLowerCase())
        let postContent = (postInfo.description).replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, "");

        result = {
                "version": "1.0",
                "response": {
                    "outputSpeech": {
                        "type": "SSML",
                        "ssml": `<speak>${postContent}</speak>`
                    },
                    "card": {
                        "type": "Simple",
                        "title": "Voice Blog",
                        "content": `Nothing`
                    },
                    "shouldEndSession": true
                }

        }
          return result
      }else if(event.request.intent.name === 'createPost') {
          title = ''
          content = ''
        title = event.request.intent.slots.title.value
        result = {

              "version": "1.0",
              "response": {
                  "outputSpeech": {
                      "type": "PlainText",
                      "text": `A new post with title ${title}. To add content say 'Add content' or to publish post say 'Publish post'`
                  },
                  "card": {
                      "type": "Simple",
                      "title": "Voice Blog",
                      "content": `A new post with title ${title}. To add content say 'Add content' or to publish post say 'Publish post'`
                  },
                  "shouldEndSession": false
              }

      }
        return result
    }else if(event.request.intent.name === 'addContent') {
        content = `${content} ${event.request.intent.slots.content.value}.`
        result = {

              "version": "1.0",
              "response": {
                  "outputSpeech": {
                      "type": "PlainText",
                      "text": `Content is added to the post with ${title}. To add more content say 'Add content' or to publish post say 'publish post'`
                  },
                  "card": {
                      "type": "Simple",
                      "title": "Voice Blog",
                      "content": `Content is added to the post with ${title}. To add more content say 'Add content' or to publish post say 'publish post'`
                  },
                  "shouldEndSession": false
              }

      }
        return result
    }else if(event.request.intent.name === 'publishPost') {

        result = {

              "version": "1.0",
              "response": {
                  "outputSpeech": {
                      "type": "PlainText",
                      "text": `Title of the post is ${title}. Content of the post is ${content}. Do you want to publsih the post as draft or public`
                  },
                  "card": {
                      "type": "Simple",
                      "title": "Voice Blog",
                      "content": `Title of the post is ${title}. Content of the post is ${content}. Do you want to publsih the post as draft or public`
                  },
                  "shouldEndSession": false
              }

      }
        return result
    }else if(event.request.intent.name === 'postDraft') {

        let createdPost = await createPostDraft(accessToken,userObj.data.id,title,content)

        result = {

              "version": "1.0",
              "response": {
                  "outputSpeech": {
                      "type": "PlainText",
                      "text": `A new post is created as draft with ${title} in medium`
                  },
                  "card": {
                      "type": "Simple",
                      "title": "Voice Blog",
                      "content": `A new post is created as draft with ${title} in medium`
                  },
                  "shouldEndSession": true
              }

      }
        title = ''
        content = ''
        return result
    }else if(event.request.intent.name === 'postPublic') {
        let createdPost = await createPostPublic(accessToken,userObj.data.id,title,content)

        result = {

              "version": "1.0",
              "response": {
                  "outputSpeech": {
                      "type": "PlainText",
                      "text": `A new post is created as public with ${title} in medium`
                  },
                  "card": {
                      "type": "Simple",
                      "title": "Voice Blog",
                      "content": `A new post is created as public with ${title} in medium`
                  },
                  "shouldEndSession": true
              }

      }
        title = ''
        content = ''
        return result
    }else if(await event.request.intent.name === 'AMAZON.StopIntent'){
      result = {

                  "version": "1.0",
                  "response": {
                      "outputSpeech": {
                          "type": "PlainText",
                          "text": "see you soon. Keep Blogging"
                      },
                      "card": {
                          "type": "Simple",
                          "title": "Voice Blog",
                          "content": "Hello World"
                      },
                      "shouldEndSession": true
                  }

          }
      return result
    }else if(await event.request.intent.name === 'AMAZON.FallbackIntent'){
        result = {
  
                    "version": "1.0",
                    "response": {
                        "outputSpeech": {
                            "type": "PlainText",
                            "text": "Voice blog cannot serve that request. You can do some cool stuff like 'create or read posts and get your profile information' from medium. You can say Get user information, get all posts, create post."
                        },
                        "card": {
                            "type": "Simple",
                            "title": "Voice Blog",
                            "content": "Hello World"
                        },
                        "shouldEndSession": false
                    }
  
            }
        return result
    }else if(await event.request.intent.name === 'AMAZON.CancelIntent'){
        result = {
  
                    "version": "1.0",
                    "response": {
                        "outputSpeech": {
                            "type": "PlainText",
                            "text": "See you soon. Keep Blogging"
                        },
                        "card": {
                            "type": "Simple",
                            "title": "Voice Blog",
                            "content": "Hello World"
                        },
                        "shouldEndSession": true
                    }
  
            }
        return result
    }
  }
}
