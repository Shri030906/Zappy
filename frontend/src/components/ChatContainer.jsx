import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
const bannedWords = [
  "Arsehole","Asshat","Asshole","Bastard (slang)","Big black cock","Bitch (slang)","Bloody","Blowjob","Bollocks","Bugger","Bullshit","Chicken shit","Clusterfuck","Cock (slang)","Cocksucker","Coonass","Cornhole (slang)","Cox–Zucker machine","Cracker (term)","Crap (word)","Cunt","Damn","Dick (slang)","Dumbass","Enshittification","Faggot","Feck","List of films that most frequently use the word fuck","Fuck","Fuck her right in the pussy","Fuck Joe Biden","Fuck, marry, kill","Fuckery","Grab 'em by the pussy","Healslut","If You See Kay","Jesus fucking christ","Kike","Motherfucker","Nigga","Nigger","Use of nigger in proper names","Paki (slur)","Poof","Poofter","Prick (slang)","Pussy","Ratfucking","Retard (pejorative)","Russian warship, go fuck yourself","Serving cunt","Shit","Shit happens","Shithouse","Shitposting","Shitter","Shut the fuck up","Shut the hell up","Slut","Son of a bitch","Spic","Taking the piss","Twat","Unclefucker","Wanker","Whore",
  "mierda","joder",
  "merde","putain",
  "scheiße","verdammt",
  "aad","aand","bahenchod","behenchod","bhenchod","bhenchodd","b.c.","bc","bakchod","bakchodd","bakchodi","bevda","bewda","bevdey","bewday","bevakoof","bevkoof","bevkuf","bewakoof","bewkoof","bewkuf","bhadua","bhaduaa","bhadva","bhadvaa","bhadwa","bhadwaa","bhosada","bhosda","bhosdaa","bhosdike","bhonsdike","bsdk","b.s.d.k","bhosdiki","bhosdiwala","bhosdiwale","bhosadchodal","bhosadchod","bhosadchodal","bhosadchod","babbe","babbey","bube","bubey","bur","burr","buurr","buur","charsi","chooche","choochi","chuchi","chhod","chod","chodd","chudne","chudney","chudwa","chudwaa","chudwane","chudwaane","choot","chut","chute","chutia","chutiya","chutiye","chuttad","chutad","dalaal","dalal","dalle","dalley","fattu","gadha","gadhe","gadhalund","gaand","gand","gandu","gandfat","gandfut","gandiya","gandiye","goo","gu","gote","gotey","gotte","hag","haggu","hagne","hagney","harami","haramjada","haraamjaada","haramzyada","haraamzyaada","haraamjaade","haraamzaade","haraamkhor","haramkhor","jhat","jhaat","jhaatu","jhatu","kutta","kutte","kuttey","kutia","kutiya","kuttiya","kutti","landi","landy","laude","laudey","laura","lora","lauda","ling","loda","lode","lund","launda","lounde","laundey","laundi","loundi","laundiya","loundiya","lulli","maar","maro","marunga","madarchod","madarchodd","madarchood","madarchoot","madarchut","m.c.","mc","mamme","mammey","moot","mut","mootne","mutne","mooth","muth","nunni","nunnu","paaji","paji","pesaab","pesab","peshaab","peshab","pilla","pillay","pille","pilley","pisaab","pisab","pkmkb","porkistan","raand","rand","randi","randy","suar","tatte","tatti","tatty","ullu","आंड़","आंड","आँड","बहनचोद","बेहेनचोद","भेनचोद","बकचोद","बकचोदी","बेवड़ा","बेवड़े","बेवकूफ","भड़ुआ","भड़वा","भोसड़ा","भोसड़ीके","भोसड़ीकी","भोसड़ीवाला","भोसड़ीवाले","भोसरचोदल","भोसदचोद","भोसड़ाचोदल","भोसड़ाचोद","बब्बे","बूबे","बुर","चरसी","चूचे","चूची","चुची","चोद","चुदने","चुदवा","चुदवाने","चूत","चूतिया","चुटिया","चूतिये","चुत्तड़","चूत्तड़","दलाल","दलले","फट्टू","गधा","गधे","गधालंड","गांड","गांडू","गंडफट","गंडिया","गंडिये","गू","गोटे","हग","हग्गू","हगने","हरामी","हरामजादा","हरामज़ादा","हरामजादे","हरामज़ादे","हरामखोर","झाट","झाटू","कुत्ता","कुत्ते","कुतिया","कुत्ती","लेंडी","लोड़े","लौड़े","लौड़ा","लोड़ा","लौडा","लिंग","लोडा","लोडे","लंड","लौंडा","लौंडे","लौंडी","लौंडिया","लुल्ली","मार","मारो","मारूंगा","मादरचोद","मादरचूत","मादरचुत","मम्मे","मूत","मुत","मूतने","मुतने","मूठ","मुठ","नुननी","नुननु","पाजी","पेसाब","पेशाब","पिल्ला","पिल्ले","पिसाब","पोरकिस्तान","रांड","रंडी","सुअर","सूअर","टट्टे","टट्टी","उल्लू"
];

const replaceBadWords = (text) => {
  if (!text) return text;
  let replaced = text;
  bannedWords.forEach((word) => {
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}(?=\\W|$)`, "gi");
    replaced = replaced.replace(regex, "[Inappropriate content]");
  });
  return replaced;
};

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    chatType,
    showInappropriateWords,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages, chatType]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  const isBusinessChat = chatType === "business";

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col relative group">
              {(message.senderId === authUser._id || message.receiverId === authUser._id) && (
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this message?")) {
                      useChatStore.getState().deleteMessage(message._id);
                    }
                  }}
                  className={`absolute top-0 text-error opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 ${
                    message.senderId === authUser._id ? "-left-8" : "-right-8"
                  }`}
                  title="Delete message"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && (
                <p>
                  {isBusinessChat ? replaceBadWords(message.text) : (showInappropriateWords ? message.text : replaceBadWords(message.text))}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <MessageInput isBusinessChat={isBusinessChat} />
    </div>
  );
};
export default ChatContainer;
