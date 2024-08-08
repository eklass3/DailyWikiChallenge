'use client';


export default function Home() {
    return (
        <main className="container">
            <div style={{width: '90%'}}>
                <h1 className="title">Daily Wiki Challenge</h1>
                <div style={{height: 1, backgroundColor: '#000000'}}/>
                <p style={{maxWidth: 1000, lineHeight: 1.5}}>Daily Wiki Challenge is a ML driven trivia game based on the vast amount of public data available through Wikipedia. The goal of the game is to determine what article the question is referencing. The answer will always be a title of a Wikipedia article. Currently there are two game modes, Daily Challenge, and Test Mode. The objective of this game is to have a new and fun way to learn from Wikipedia.</p>
                <h2>Daily Challenge</h2>
                <p style={{maxWidth: 1000, lineHeight: 1.5}}>This mode displays a new trivia question everyday based on current world events and popular Wikipedia articles. You have unlimited guesses to try to figure out what the answer article is. Each hint you take will reduce the number of stars you can win: no hints = 5x⭐, 1 hint = 3x⭐, 2 hints = 2x⭐, and 3 hints = 1x⭐. Build your daily streak (🔥) by answering questions for consecutive days. </p>
                <h2>Test Mode</h2>
                <p style={{maxWidth: 1000, lineHeight: 1.5}}>This mode starts by displaying popular Wikipedia article. As you answer questions, it begins to build a model of what you perform well on (and not so well on), and gradually builds a trivia game that is ideal for you. You have three chances to answer the questions incorrectly before you lose your stars and must restart. The star scoring with hints is the same as Daily Challenge. You have the option to skip a question, but it will cost you a star, unless you have none left.</p>
                <p style={{maxWidth: 1000, lineHeight: 1.5}}>For all game modes you will probably notice the occasional odd wording in the questions. This is typical GPT LLM growing pains. I’m hoping it will improve as time goes on, and I improve my prompts! My best tip for new players – think from the perspective of browsing Wikipedia. All the answers are actual Wikipedia article titles, so they may not be what you expect!</p>
                <p style={{maxWidth: 1000, lineHeight: 1.5}}>Daily Wiki Challenge was designed and engineered by <a href={"https://www.linkedin.com/in/eric-klassen-551616205/"} target="_blank">Eric Klassen</a> using Python Flask, OpenAI GPT4, and Next.js. Feel free to send me a message if you have any suggestions: eaklassen [at] gmail.com.</p>
             </div>
        </main>
    )
}