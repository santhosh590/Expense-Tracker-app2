import { useState, useContext, useRef, useEffect } from "react";
import { TransactionContext } from "../context/TransactionContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { formatCurrency } from "../utils/formatCurrency";
import { Sparkles, Send, Bot, Loader2, ArrowRight } from "lucide-react";

export default function AiAdvisor() {
  const { transactions } = useContext(TransactionContext);
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: "Hi there! 👋 I'm your virtual Financial Advisor. I can analyze your spending habits and provide tailored insights. What would you like to know about your finances today?",
      options: [
        "Analyze my spending this month",
        "How can I save more money?",
        "What is my biggest expense category?",
      ],
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  /* Mock AI logic mapping user questions to predefined patterns and dynamic data */
  const simulateAiResponse = async (userText) => {
    return new Promise(async (resolve) => {
      // Simulate typing delay
      await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));
      
      try {
        const text = userText.toLowerCase();
        let response = "";
        
        // Analyze recent transactions
        const currentMonth = new Date().getMonth();
        const thisMonthTx = transactions.filter(t => new Date(t.date).getMonth() === currentMonth && t.type === "expense");
        const totalThisMonth = thisMonthTx.reduce((sum, t) => sum + Number(t.amount), 0);
        
        // Group by category
        const cats = {};
        thisMonthTx.forEach(t => {
            cats[t.category] = (cats[t.category] || 0) + Number(t.amount);
        });
        const topCategory = Object.entries(cats).sort((a,b) => b[1] - a[1])[0];

        if (["today", "todays"].some(k => text.includes(k))) {
            const today = new Date().toLocaleDateString();
            const todayTx = transactions.filter(t => new Date(t.date).toLocaleDateString() === today);
            
            if (todayTx.length === 0) {
                response = "You don't have any transactions logged for today.";
            } else {
               const todaySpent = todayTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
               const todayEarned = todayTx.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
               
               response = `Here are your transactions for today.`;
               if (todaySpent > 0 && todayEarned > 0) {
                   response += `\nSpent today: **${formatCurrency(todaySpent)}** | Earned today: **${formatCurrency(todayEarned)}**\n\n`;
               } else if (todaySpent > 0) {
                   response += `\nSpent today: **${formatCurrency(todaySpent)}**\n\n`;
               } else if (todayEarned > 0) {
                   response += `\nEarned today: **${formatCurrency(todayEarned)}**\n\n`;
               } else {
                   response += `\n\n`;
               }

               todayTx.forEach((t, i) => {
                   const amountStr = t.type === 'expense' ? `-${formatCurrency(t.amount)}` : `+${formatCurrency(t.amount)}`;
                   response += `\n#${i + 1}\n**${t.title}**\n${t.category} • ${new Date(t.date).toLocaleDateString("en-IN")}\n${amountStr}\n`;
               });
            }
        } else if (["lowest", "smallest", "minimum", "min", "cheap", "low"].some(k => text.includes(k))) {
            if (thisMonthTx.length === 0) {
                response = "I couldn't find any expenses for this month to analyze.";
            } else {
                const smallestTx = [...thisMonthTx].sort((a,b) => Number(a.amount) - Number(b.amount))[0];
                response = `Your single smallest expense this month was **${smallestTx.title}** under the **${smallestTx.category}** category, costing you only **${formatCurrency(smallestTx.amount)}** on ${new Date(smallestTx.date).toLocaleDateString()}.`;
            }
        } else if (["analyze", "spending", "summary", "overview", "how much", "total", "report"].some(k => text.includes(k))) {
            response = `Based on your recent data, you have spent **${formatCurrency(totalThisMonth)}** so far this month. ` +
                (topCategory ? `\n\nYour highest spending category is **${topCategory[0]}**, taking up ${formatCurrency(topCategory[1])} of your budget. I suggest reviewing your ${topCategory[0]} expenses to see where you can cut back.` : "You don't have enough expenses logged yet to give a deep analysis.");
        } else if (["save", "saving", "budget", "reduce", "cut back", "tips", "advice"].some(k => text.includes(k))) {
            response = "To increase your savings rate, try applying the **50/30/20 rule**:\n\n" +
                "• **50%** on Needs (Housing, Groceries)\n" +
                "• **30%** on Wants (Entertainment, Dining)\n" +
                "• **20%** on Savings/Investments\n\n" +
                "Would you like me to create a mock budget using this rule based on your total income?";
        } else if (["biggest", "highest", "largest", "maximum", "max", "top", "expensive", "high"].some(k => text.includes(k))) {
            if (thisMonthTx.length === 0) {
                response = "I couldn't find any expenses for this month to analyze.";
            } else {
                const biggestTx = [...thisMonthTx].sort((a,b) => Number(b.amount) - Number(a.amount))[0];
                response = `Your single largest expense this month was **${biggestTx.title}** under the **${biggestTx.category}** category, costing you **${formatCurrency(biggestTx.amount)}** on ${new Date(biggestTx.date).toLocaleDateString()}.`;
            }
        } else if (["all transactions", "every transaction", "show all", "history", "list all", "everything"].some(k => text.includes(k))) {
            if (transactions.length === 0) {
                response = "You don't have any transactions logged yet!";
            } else {
               const totalSpent = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
               const totalEarned = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
               
               response = `Here is an overview of all your transactions. You have **${transactions.length}** in total.`;
               if (totalSpent > 0 && totalEarned > 0) {
                   response += `\nLifetime spent: **${formatCurrency(totalSpent)}** | Lifetime earned: **${formatCurrency(totalEarned)}**\n\n`;
               } else if (totalSpent > 0) {
                   response += `\nLifetime spent: **${formatCurrency(totalSpent)}**\n\n`;
               } else if (totalEarned > 0) {
                   response += `\nLifetime earned: **${formatCurrency(totalEarned)}**\n\n`;
               } else {
                   response += `\n\n`;
               }

               transactions.slice(0, 8).forEach((t, i) => {
                   const amountStr = t.type === 'expense' ? `-${formatCurrency(t.amount)}` : `+${formatCurrency(t.amount)}`;
                   response += `\n#${i + 1}\n**${t.title}**\n${t.category} • ${new Date(t.date).toLocaleDateString("en-IN")}\n${amountStr}\n`;
               });
               if (transactions.length > 8) {
                   response += `\n*...and ${transactions.length - 8} more.*`;
               }
            }
        } else if (["find", "search", "show", "get", "look", "what"].some(k => text.includes(k))) {
            const keywordsToStrip = [
                "show me my transactions for", "show me transactions for", "search transactions for", 
                "find transactions for", "find transaction for", "search for", "show me", 
                "what is my", "what are my", "get me", "look for",
                "search", "find", "show", "get", "what"
            ];
            let searchTerm = text;
            for (const kw of keywordsToStrip) {
                if (searchTerm.includes(kw)) {
                    searchTerm = searchTerm.replace(kw, "").trim();
                    break;
                }
            }
            searchTerm = searchTerm.replace(/['"?.!]/g, "").trim();

            if (!searchTerm || keywordsToStrip.includes(searchTerm)) {
                response = "Please specify what you want to search for! For example, try asking **'Find transactions for Amazon'** or **'Search for food'**.";
            } else {
                const matches = transactions.filter(t => t.title.toLowerCase().includes(searchTerm) || t.category.toLowerCase().includes(searchTerm));
                if (matches.length === 0) {
                   response = `I couldn't find any transactions matching **"${searchTerm}"**.`;
                } else {
                   const totalSpent = matches.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
                   const totalEarned = matches.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
                   
                   response = `I found **${matches.length}** transaction(s) matching **"${searchTerm}"**.`;
                   if (totalSpent > 0 && totalEarned > 0) {
                       response += `\nTotal spent: **${formatCurrency(totalSpent)}** | Total earned: **${formatCurrency(totalEarned)}**\n\n`;
                   } else if (totalSpent > 0) {
                       response += `\nTotal spent: **${formatCurrency(totalSpent)}**\n\n`;
                   } else if (totalEarned > 0) {
                       response += `\nTotal earned: **${formatCurrency(totalEarned)}**\n\n`;
                   } else {
                       response += `\n\n`;
                   }

                   matches.slice(0, 5).forEach((t, i) => {
                       const amountStr = t.type === 'expense' ? `-${formatCurrency(t.amount)}` : `+${formatCurrency(t.amount)}`;
                       response += `\n#${i + 1}\n**${t.title}**\n${t.category} • ${new Date(t.date).toLocaleDateString("en-IN")}\n${amountStr}\n`;
                   });
                   if (matches.length > 5) {
                       response += `\n*...and ${matches.length - 5} more.*`;
                   }
                }
            }
        } else if (/\b(hi|hello|hey|good morning|vanakkam|namaste|morning|evening|yo|sup)\b/.test(text)) {
            response = "Hello there! 👋 I'm your AI Financial Advisor. You can ask me things like 'how much did I spend today' or 'show me my highest expense'. How can I help you?";
        } else if (/\b(who made you|who created you|creator|author)\b/.test(text)) {
            response = "I was created by Santhosh as part of this awesome ExpensePro portfolio project! 🚀";
        } else if (/\b(thanks|thank you|awesome|super|ok|okay|good|great|perfect|nice|wow|cool|amazing|brilliant|excellent)\b/.test(text)) {
            response = "You're very welcome! 😊 I'm always here to help you keep your budget on track. What else would you like to explore?";
        } else if (/\b(who are you|what can you do|help|how to use|features|what are you)\b/.test(text)) {
            response = "I am your personal AI Financial Advisor! 🤖 I can parse your natural language to filter transactions, calculate daily or lifetime totals, find your highest/lowest expenses, and give saving tips. Try asking me 'analyze my spending' or 'search for Amazon'.";
        } else if (/\b(bye|goodbye|see you|tata|later|cya|goodnight|night)\b/.test(text)) {
            response = "Goodbye! Make sure to keep tracking those expenses. Have a great day! 👋";
        } else if (/\b(how are you|how do you do|whatsup|whats up|hows it going)\b/.test(text)) {
            response = "I'm doing great, thanks for asking! Always ready to crunch some numbers for you. 📊 Want to see your spending summary?";
        } else if (/\b(joke|funny|laugh|bored)\b/.test(text)) {
            response = "Why did the student eat his homework? Because his teacher told him it was a piece of cake! 🍰 Anyway, back to finances... want to see your biggest expense?";
        } else if (/\b(yes|yeah|yep|sure|yup|haan|ama)\b/.test(text)) {
            response = "Awesome! Just tell me exactly what you're looking for, like 'show me all transactions' or 'what did I spend today'.";
        } else if (/\b(no|nope|nah|nevermind|never mind|cancel|illa|vendam)\b/.test(text)) {
            response = "No problem at all! Let me know when you need me. I'll be right here. 🤖";
        } else if (/\b(broke|no money|sad|poor)\b/.test(text)) {
            response = "Don't worry, everyone starts somewhere! Track every single expense carefully, avoid impulse buying, and you'll slowly see your savings grow. I'm here to support you! 💪";
        } else if (/\b(rich|happy|lot of money|wealthy)\b/.test(text)) {
            response = "That's fantastic to hear! 🎉 Make sure to direct those extra funds into smart investments and savings goals to build long-term wealth.";
        } else if (/\b(love you|smart|good bot|best|marry me)\b/.test(text)) {
            response = "Aww, thank you! 💙 Unfortunately my heart belongs to data and numbers. But I promise to always be your loyal financial companion!";
        } else if (/\b(fuck|shit|bitch|bastard|otha|punda|baadu|loose)\b/.test(text)) {
            response = "Let's keep the language friendly! 😇 I'm just an innocent AI trying to help you save money. Can I help you analyze your spending instead?";
        } else if (/^\s*[.?!\s]*\s*$/.test(text) || text.length === 0) {
            response = "Hmm, looks like you didn't say anything! What's on your mind?";
        } else if (["who am i", "my name", "who is logic", "who is login", "user info", "who is this", "identify", "identity", "what is my name", "who am i", "user details", "my profile", "who is logged in"].some(k => text.includes(k))) {
            response = `You are logged in as **${user?.name || "User"}**. Welcome to your personalized Financial Advisor!`;
        } else if (["total balance", "current balance", "net worth", "balance"].some(k => text.includes(k))) {
            const totalSpent = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
            const totalEarned = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
            const balance = totalEarned - totalSpent;
            response = `Your current total balance is **${formatCurrency(balance)}**.\n\nTotal Lifetime Earned: ${formatCurrency(totalEarned)}\nTotal Lifetime Spent: ${formatCurrency(totalSpent)}`;
        } else if (["total expense", "lifetime expense", "all expenses"].some(k => text.includes(k))) {
            const totalSpent = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
            response = `Your total lifetime expenses amount to **${formatCurrency(totalSpent)}**. Keep tracking to find opportunities to save!`;
        } else if (["distribution", "income vs expense", "income vs expenses", "ratio"].some(k => text.includes(k))) {
            const totalSpent = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
            const totalEarned = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
            const total = totalEarned + totalSpent;
            const expensePct = total > 0 ? ((totalSpent / total) * 100).toFixed(1) : 0;
            const incomePct = total > 0 ? ((totalEarned / total) * 100).toFixed(1) : 0;
            response = `⚖️ **Income vs Expense Distribution**\n\n**Income:** ${formatCurrency(totalEarned)} (${incomePct}%)\n**Expense:** ${formatCurrency(totalSpent)} (${expensePct}%)`;
        } else if (["order by", "top expenses", "rank my expenses", "name with order", "highest expenses ordered"].some(k => text.includes(k))) {
            const expenses = transactions.filter(t => t.type === 'expense').sort((a,b) => Number(b.amount) - Number(a.amount)).slice(0, 5);
            if (expenses.length === 0) {
                response = "You don't have any expenses logged yet.";
            } else {
                response = "Here are your top highest expenses ordered by amount:\n";
                expenses.forEach((t, i) => {
                    response += `\n#${i + 1}\n**${t.title}**\n${t.category} • ${new Date(t.date).toLocaleDateString("en-IN")}\n${formatCurrency(t.amount)}\n`;
                });
            }
        } else if (["savings", "goals", "saving target", "savings goal check"].some(k => text.includes(k))) {
            try {
                const res = await api.get("/savings");
                const goals = res.data;
                if (!goals || goals.length === 0) {
                    response = "You don't have any active savings goals. You can create one in the Savings Goals tab!";
                } else {
                    const totalTarget = goals.reduce((s, g) => s + (g.targetAmount || 0), 0);
                    const totalSaved = goals.reduce((s, g) => s + (g.currentAmount || 0), 0);
                    response = `You have **${goals.length}** savings goals. In total, you have saved **${formatCurrency(totalSaved)}** out of your **${formatCurrency(totalTarget)}** target.\n\n`;
                    goals.forEach(g => {
                        const pct = g.targetAmount > 0 ? Math.min(100, (g.currentAmount / g.targetAmount) * 100).toFixed(0) : 0;
                        response += `• **${g.title}**: ${formatCurrency(g.currentAmount)} / ${formatCurrency(g.targetAmount)} (${pct}% completed)\n`;
                    });
                }
            } catch (err) {
                response = "I couldn't fetch your savings goals at the moment. Please try again later.";
            }
        } else if (["split", "owe", "shared bills", "split goal details", "split details"].some(k => text.includes(k))) {
            try {
                const res = await api.get("/splits");
                const splits = res.data;
                if (!splits || splits.length === 0) {
                    response = "You don't have any split expenses right now.";
                } else {
                    const totalOwed = splits.reduce((s, sp) => {
                        return s + sp.participants.filter(p => !p.settled).reduce((a, p) => a + p.share, 0);
                    }, 0);
                    response = `You have **${splits.length}** split expenses on record. There is currently **${formatCurrency(totalOwed)}** outstanding to be settled.\n\n`;
                    splits.slice(0, 4).forEach(s => {
                         const settledCount = s.participants.filter(p => p.settled).length;
                         response += `• **${s.title}** (${formatCurrency(s.totalAmount)}): ${settledCount}/${s.participants.length} settled\n`;
                    });
                    if (splits.length > 4) response += `\n*...and ${splits.length - 4} more.*`;
                }
            } catch (err) {
                response = "I couldn't fetch your split details at the moment. Please try again later.";
            }
        } else {
            response = "I'm not quite sure simulating an answer for that yet! Try asking me something like **'how much did I spend'**, **'what is my highest expense'**, **'how to save money'**, or **'search for Amazon'** to see my data-driven insights in action!";
        }

        resolve({
          id: Date.now(),
          role: "assistant",
          content: response,
        });
      } catch (error) {
        console.error(error);
        resolve({
          id: Date.now(),
          role: "assistant",
          content: "Oops! Something went wrong while analyzing your data. Please try again.",
        });
      }
    });
  };

  const handleSend = async (text = input) => {
    if (!text.trim()) return;
    
    const userMsg = { id: Date.now(), role: "user", content: text };
    setMessages(prev => [...prev.map(m => ({ ...m, options: null })), userMsg]); // Remove options from previous
    setInput("");
    setIsTyping(true);

    const botMsg = await simulateAiResponse(text);
    
    setIsTyping(false);
    setMessages(prev => [...prev, botMsg]);
  };

  const handleOptionClick = (opt) => {
    handleSend(opt);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <div className="page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 14,
              background: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(236,72,153,0.1))",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Sparkles size={20} style={{ color: "#a855f7" }} />
            </div>
            AI Financial Advisor
            <span style={{ fontSize: 11, padding: "2px 8px", background: "rgba(168,85,247,0.15)", color: "#a855f7", borderRadius: 12, fontWeight: 800 }}>BETA</span>
          </div>
          <div className="page-subtitle">Personalized financial insights powered by simulated contextual intelligence</div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden", position: "relative" }}>
        
        {/* Messages Area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{
              display: "flex", gap: 14,
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
            }}>
              {msg.role === "assistant" && (
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: "linear-gradient(135deg, #a855f7, #ec4899)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "white"
                }}>
                  <Bot size={18} />
                </div>
              )}
              
              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  padding: "14px 18px",
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: msg.role === "user" ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "var(--glass)",
                  border: msg.role === "assistant" ? "1px solid var(--border)" : "none",
                  color: msg.role === "user" ? "#fff" : "var(--text)",
                  fontSize: 14, lineHeight: 1.5,
                  boxShadow: msg.role === "user" ? "0 4px 12px rgba(99,102,241,0.2)" : "none",
                  whiteSpace: "pre-wrap"
                }}>
                  {/* Simple bold parser for markdown feeling */}
                  {msg.content.split('**').map((part, i) => i % 2 !== 0 ? <strong key={i}>{part}</strong> : part)}
                </div>

                {/* Suggestion Options */}
                {msg.options && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                    {msg.options.map((opt, i) => (
                      <button key={i} onClick={() => handleOptionClick(opt)} style={{
                        padding: "8px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.2)",
                        color: "var(--text)", cursor: "pointer", transition: "all 0.2s",
                        display: "flex", alignItems: "center", gap: 6
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(168,85,247,0.12)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(168,85,247,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}
                      >
                        {opt} <ArrowRight size={12} style={{ opacity: 0.5 }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
             <div style={{ display: "flex", gap: 14, alignSelf: "flex-start" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: "linear-gradient(135deg, #a855f7, #ec4899)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "white"
                }}>
                  <Bot size={18} />
                </div>
                <div style={{
                  padding: "16px 20px", borderRadius: "18px 18px 18px 4px",
                  background: "var(--glass)", border: "1px solid var(--border)",
                  color: "var(--muted)", display: "flex", alignItems: "center", gap: 6
                }}>
                   <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Generating insight...
                </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{
          padding: "18px 24px", borderTop: "1px solid var(--border)",
          background: "var(--glass)", backdropFilter: "blur(10px)",
        }}>
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ position: "relative", display: "flex" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your finances..."
              style={{
                width: "100%", padding: "16px 20px", paddingRight: 50,
                borderRadius: 24, border: "1px solid var(--border)",
                background: "var(--card-dark)", color: "var(--text)",
                fontSize: 14, outline: "none",
                transition: "all 0.2s",
              }}
              onFocus={(e) => e.target.style.borderColor = "#a855f7"}
              onBlur={(e) => e.target.style.borderColor = "var(--border)"}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              style={{
                position: "absolute", right: 6, top: 6, bottom: 6,
                padding: "0 14px", borderRadius: "50%",
                background: input.trim() ? "linear-gradient(135deg, #a855f7, #ec4899)" : "var(--glass)",
                border: "none", color: input.trim() ? "white" : "var(--muted)",
                cursor: input.trim() ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s"
              }}
            >
              <Send size={16} style={{ transform: input.trim() ? "translateX(2px)" : "none" }} />
            </button>
          </form>
          <div style={{ textAlign: "center", fontSize: 11, color: "var(--muted)", marginTop: 10 }}>
            AI insights are simulated for demonstration.
          </div>
        </div>

      </div>
    </div>
  );
}
