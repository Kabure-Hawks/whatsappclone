import React, { useState, useEffect, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';
import './ChatWindow.css';

import MessageItem from './MessageItem'

import Api from '../Api';

import SearchIcon from '@material-ui/icons/Search';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon';
import CloseIcon from '@material-ui/icons/Close';
import SendIcon from '@material-ui/icons/Send';
import MicIcon from '@material-ui/icons/Mic';

export default ({user, data}) =>{

    const body = useRef();

    let recognition = null;
    let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if(SpeechRecognition !== undefined){
        recognition = new SpeechRecognition();
    }

    const [emojiOpen, setEmojiOpen] = useState(false);
    const [text, setText] = useState('');
    const [listening, setListening] = useState(false);
    const [list, setList] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect (()=>{

        setList([]);
        let unsub = Api.onChatContent(data.chatId, setList, setUsers);
        return unsub;
    }, [data.chatId]);

    useEffect(()=>{
        if(body.current.scrollHeight > body.current.offsetHeight){
            body.current.scrollTop = body.current.scrollHeight - body.current.offsetHeight;
        }
    }, [list]);

    const handleEmojiClick = (e, emojiObject) =>{
        setText(text + emojiObject.emoji);
    }

    const handleOpenEmoji = () =>{
        setEmojiOpen(true);
    }

    const handleCloseEmoji = () =>{
        setEmojiOpen(false);
    }

    const handleMicClick = () =>{
        if(recognition !== null){

            recognition.onstart = () =>{
                setListening(true);
            }
            recognition.onend = () =>{
                setListening(false);
            }
            recognition.onresult = (e) =>{
                setText( e.results[0][0].transcript );
            }

            recognition.start();

        }

        console.log(recognition);
    }

    const handleInputKeyUp = (e) => {
        if(e.keyCode === 13) {
            handleSendClick();
        }
    }

    const handleSendClick = () =>{
        if(text !== ''){
            Api.sendMessage(data, user.id,'text', text, users);
            setText('');
            setEmojiOpen(false);
        }
    }

    return (
        <div className="chatWindow">
            <div className="chatWindow--header">

                <div className="chatWindow-headerinfo">
                    <img className="chatWindow-avatar" src={data.image} alt="" />
                    <div className="chatWindow-name">{data.title}</div>
                </div>

                <div className="chatWindow-headerbuttons">

                    <div className="chatWindow-btn">
                        < SearchIcon style={{color: '#FFF'}}/>
                    </div>
                    <div className="chatWindow-btn">
                        < AttachFileIcon style={{color: '#FFF'}}/>
                    </div>
                    <div className="chatWindow-btn">
                        < MoreVertIcon style={{color: '#FFF'}}/>
                    </div>

                </div>

            </div>
            <div ref={body} className="chatWindow--body">
                {list.map((item, key) => (
                    <MessageItem
                        key={key}
                        data={item}
                        user={user}
                    />
                ))}
            </div>

            <div className="chatWindow--emojiArea"
            style={{height: emojiOpen ? '250px' : '0px'}}
            
            >
                <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    disableSearchBar
                    disableSkinTonePicker

                />
            </div>

            <div className="chatWindow--footer">

                <div className="chatWindow-pre">

                    <div className="chatWindow-btn" onClick={handleCloseEmoji} style={{width: emojiOpen?40:0}}>
                        < CloseIcon style={{color: '#FFF'}}/>
                    </div>

                    <div className="chatWindow-btn" onClick={handleOpenEmoji}>
                        < InsertEmoticonIcon style={{color: emojiOpen?'#3c4b74':'#FFF'}}/>
                    </div>

                </div>
                <div className="chatWindow-inputArea">
                    <input className="chatWindow-input" type="text" placeholder="Digite uma mensagem" 
                    value={text} onChange={e=>setText(e.target.value)} onKeyUp={handleInputKeyUp}/>
                    
                </div>
                <div className="chatWindow-pos">
                    

                    {text === '' &&
                        <div onClick={handleMicClick} className="chatWindow-btn">
                            < MicIcon style={{color: listening? '#913f3f':'#FFF'}}/>
                        </div>
                    }

                    {text !== '' &&
                        <div onClick={handleSendClick} className="chatWindow-btn">
                            < SendIcon style={{color: '#FFF'}}/>
                        </div>
                    }

                </div>

            </div>
        </div>
    );
}