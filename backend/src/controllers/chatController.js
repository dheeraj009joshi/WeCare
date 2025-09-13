const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getModels } = require('../models');
const fs = require('fs');
const path = require('path');

console.log("Gemini API Key:", process.env.GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chatWithGemini = async (req, res) => {
  const { ChatSession, Message, User, Escalation } = getModels();
  const { message, greet, sessionId } = req.body;
  
  // If greet flag is set or message is empty, send greeting
  if (greet || !message || message.trim() === "") {
    return res.json({
      response: "Hi there! I'm Ladoo, your AI health consultant. How are you feeling today? How can I assist you with your health concerns?"
    });
  }

  // Escalation detection (simple keyword-based) - Do this BEFORE Gemini API call
  let escalationTriggered = false;
  let escalationReason = '';
  let escalationId = null;
  let escalationLinks = null;
  
  const escalationKeywords = [
    'chest pain', 'severe pain', 'emergency', 'not improving', 'shortness of breath', 'loss of consciousness', 'bleeding', 'heart attack', 'stroke', 'call doctor', 'see a doctor', 'urgent', 'hospital', 'ambulance', 'fainting', 'unresponsive', 'seizure', 'difficulty breathing', 'high fever', 'persistent vomiting', 'severe injury', 'uncontrolled bleeding',
    'severe allergic reaction', 'anaphylaxis', 'severe burn', 'severe dehydration', 'severe headache', 'vision loss', 'paralysis', 'confusion', 'slurred speech', 'severe abdominal pain', 'severe back pain', 'severe chest tightness', 'severe dizziness', 'severe trauma', 'major accident', 'major injury', 'loss of vision', 'loss of speech', 'loss of movement', 'severe infection', 'sepsis', 'severe swelling', 'severe rash', 'severe bleeding', 'severe vomiting', 'severe diarrhea', 'severe weakness', 'severe fatigue', 'severe shortness of breath', 'severe palpitations', 'severe fainting', 'severe confusion', 'severe loss of consciousness', 'severe numbness', 'severe tingling', 'severe pain anywhere', 'severe discomfort', 'severe pressure', 'severe tightness', 'severe burning', 'severe stabbing pain', 'severe shooting pain', 'severe cramping', 'severe spasms', 'severe convulsions', 'severe fits', 'severe collapse', 'severe shock', 'severe poisoning', 'severe overdose', 'severe withdrawal', 'severe psychosis', 'severe hallucinations', 'severe delusions', 'severe agitation', 'severe aggression', 'severe violence', 'severe suicidal thoughts', 'severe self-harm', 'severe harm to others', 'severe risk to self', 'severe risk to others', 'severe mental health crisis', 'severe behavioral crisis', 'severe emotional crisis', 'severe crisis', 'severe emergency', 'severe life-threatening', 'life-threatening', 'life in danger', 'danger to life', 'danger to health', 'danger to safety', 'danger to others', 'danger to self', 'dangerous', 'critical', 'code blue', 'code red', 'code black', 'code white', 'code yellow', 'code orange', 'code purple', 'code pink', 'code brown', 'code grey', 'code silver', 'code gold', 'code green', 'code amber', 'code magenta', 'code maroon', 'code turquoise', 'code cyan', 'code indigo', 'code violet', 'code lavender', 'code lilac', 'code mauve', 'code periwinkle', 'code chartreuse', 'code olive', 'code lime', 'code teal', 'code navy', 'code aqua', 'code azure', 'code cobalt', 'code sapphire', 'code emerald', 'code jade', 'code ruby', 'code garnet', 'code topaz', 'code amethyst', 'code opal', 'code pearl', 'code diamond', 'code platinum', 'code titanium', 'code tungsten', 'code zircon', 'code beryl', 'code quartz', 'code onyx', 'code obsidian', 'code jet', 'code coal', 'code graphite', 'code carbon', 'code steel', 'code iron', 'code bronze', 'code copper', 'code brass', 'code nickel', 'code zinc', 'code tin', 'code lead', 'code mercury', 'code silver', 'code gold', 'code platinum', 'code palladium', 'code rhodium', 'code ruthenium', 'code osmium', 'code iridium', 'code indium', 'code gallium', 'code germanium', 'code antimony', 'code tellurium', 'code polonium', 'code astatine', 'code radon', 'code francium', 'code radium', 'code actinium', 'code thorium', 'code protactinium', 'code uranium', 'code neptunium', 'code plutonium', 'code americium', 'code curium', 'code berkelium', 'code californium', 'code einsteinium', 'code fermium', 'code mendelevium', 'code nobelium', 'code lawrencium', 'code rutherfordium', 'code dubnium', 'code seaborgium', 'code bohrium', 'code hassium', 'code meitnerium', 'code darmstadtium', 'code roentgenium', 'code copernicium', 'code nihonium', 'code flerovium', 'code moscovium', 'code livermorium', 'code tennessine', 'code oganesson',
    'consult a dr', 'consult doctor', 'consult a doctor', 'need doctor', 'want doctor', 'find doctor', 'book doctor', 'appointment doctor', 'book a doctor', 'find a doctor', 'need a doctor', 'want a doctor', 'see doctor', 'talk to doctor', 'speak to doctor', 'get doctor', 'require doctor', 'looking for doctor', 'searching for doctor', 'want to see doctor', 'need to see doctor', 'should see doctor', 'must see doctor', 'have to see doctor', 'got to see doctor', 'gotta see doctor', 'need to consult doctor', 'want to consult doctor', 'should consult doctor', 'must consult doctor', 'have to consult doctor', 'got to consult doctor', 'gotta consult doctor'
  ];
  
  const lowerMsg = message.toLowerCase();
  console.log('Checking message for escalation:', lowerMsg);
  
  for (const keyword of escalationKeywords) {
    if (lowerMsg.includes(keyword)) {
      escalationTriggered = true;
      escalationReason = `Escalation triggered by keyword: ${keyword}`;
      console.log('ESCALATION TRIGGERED by keyword:', keyword);
      break;
    }
  }
  
  // Set escalation links immediately when escalation is triggered
  if (escalationTriggered) {
    escalationLinks = {
      doctorServices: '/services'
    };
    console.log('Escalation links set:', escalationLinks);
  }
  
  console.log('Escalation state:', { escalationTriggered, escalationReason, escalationId, escalationLinks });
  
  // Create escalation record if triggered
  if (escalationTriggered && sessionId) {
    try {
      const session = await ChatSession.findByPk(sessionId);
      if (session) {
        const escalation = await Escalation.create({
          userId: session.userId,
          sessionId: sessionId,
          reason: escalationReason,
          triggeredBy: 'ai',
        });
        escalationId = escalation.id;
        // Notify doctors (placeholder)
        console.log(`DOCTOR NOTIFY: Escalation for user ${session.userId} in session ${sessionId}. Reason: ${escalationReason}`);
      }
    } catch (escalationErr) {
      console.error('Escalation creation error:', escalationErr);
      // Don't fail the entire request if escalation creation fails
    }
  }
  
  try {
    let prompt = "You are an AI health assistant. Provide helpful, accurate, and personalized health advice. Always format your response using bullet points (•) for each point. Each point should be on a new line with proper spacing. Keep responses concise but informative. Example format:\n\n• First point\n\n• Second point\n\n• Third point\n\n• Fourth point\n\n";
    prompt += "The following user info is for your context ONLY. Do NOT repeat or display it in your response. Use it only to personalize your answer.\n\n";
    
    // If sessionId is provided, fetch previous messages and user context in parallel
    let userContext = '';
    if (sessionId) {
      const [session, previousMessages] = await Promise.all([
        ChatSession.findByPk(sessionId),
        Message.findAll({
          where: { sessionId: sessionId },
          order: [['createdAt', 'ASC']]
        })
      ]);
      if (session && session.userId) {
        const user = await User.findByPk(session.userId);
        if (user) {
          userContext = `User Info:\n` +
            `Name: ${user.name || ''}\n` +
            `Email: ${user.email || ''}\n` +
            `Phone: ${user.phone || ''}\n` +
            `Address: ${user.address || ''}\n` +
            `Gender: ${user.gender || ''}\n` +
            `Age: ${user.age || ''}\n` +
            `Weight: ${user.weight || ''}\n` +
            `Height: ${user.height || ''}\n` +
            `Blood Group: ${user.bloodGroup || ''}\n` +
            `Allergies: ${user.allergies || ''}\n` +
            `Lifestyle: ${user.lifestyle || ''}\n` +
            `Profile Picture: ${user.profilePicture || ''}\n` +
            `Role: ${user.role || ''}\n`;
        }
      }
      // Use only the last 10 messages for context (to avoid token limits)
      const contextMessages = previousMessages.slice(-10);
      contextMessages.forEach(msg => {
        prompt += `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.text}\n`;
      });
      prompt = userContext + prompt;
      prompt += `User: ${message}`;
    } else {
      prompt += `User: ${message}`;
    }
    
    console.log("Gemini prompt:\n", prompt);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    res.json({ 
      response, 
      escalation: escalationTriggered, 
      escalationReason, 
      escalationId,
      escalationLinks 
    });
  } catch (err) {
    console.error('Gemini error:', err); // Log error for debugging
    
    // Even if Gemini fails, return escalation info if it was triggered
    if (escalationTriggered) {
      escalationLinks = {
        doctorServices: '/services'
      };
    }
    
    res.status(500).json({ 
      message: "Gemini error", 
      error: err.message,
      escalation: escalationTriggered,
      escalationReason,
      escalationId,
      escalationLinks
    });
  }
};

// Suggest a short, relevant chat title for a user message
exports.suggestChatTitle = async (req, res) => {
  const { ChatSession } = getModels();
  const { message } = req.body;
  try {
    const prompt = `Suggest a short, relevant chat title (max 5 words) for this health question: "${message}"`;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response.text().replace(/["\n]/g, '').trim();
    res.json({ title: response });
  } catch (err) {
    console.error('Gemini error:', err); // Log error for debugging
    res.status(500).json({ message: "Gemini error", error: err.message });
  }
};

// Create a new chat session
exports.createSession = async (req, res) => {
  const { ChatSession } = getModels();
  try {
    const { userId, title } = req.body;
    const session = await ChatSession.create({ userId, title });
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create session', error: err.message });
  }
};

// Save a message (user or AI)
exports.saveMessage = async (req, res) => {
  const { Message } = getModels();
  try {
    const { sessionId, sender, text } = req.body;
    const message = await Message.create({ sessionId, sender, text });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Failed to save message', error: err.message });
  }
};

// Get all messages for a session
exports.getMessages = async (req, res) => {
  const { Message } = getModels();
  try {
    const { sessionId } = req.params;
    const messages = await Message.findAll({ 
      where: { sessionId: sessionId },
      order: [['createdAt', 'ASC']]
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages', error: err.message });
  }
};

// Update chat session title
exports.updateSessionTitle = async (req, res) => {
  const { ChatSession } = getModels();
  try {
    const { sessionId } = req.params;
    const { title } = req.body;
    const session = await ChatSession.findByPk(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    
    await session.update({ title });
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update session title', error: err.message });
  }
};

// Upload file and analyze with AI
exports.uploadFile = async (req, res) => {
  const { FileUpload } = getModels();
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { userId, sessionId, messageText } = req.body;
    if (!userId || !sessionId) {
      return res.status(400).json({ message: 'Missing userId or sessionId' });
    }

    // Save file info to database
    const fileUpload = await FileUpload.create({
      userId: userId,
      sessionId: sessionId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadPath: req.file.path
    });

    // Create user message text
    const userMessageText = messageText && messageText.trim()
      ? `${messageText}\n\n📎 Uploaded: ${req.file.originalname}`
      : `📎 Uploaded: ${req.file.originalname}`;

    // Analyze file with Gemini if it's an image
    let aiResponse = '';
    if (req.file.mimetype.startsWith('image/')) {
      try {
        const imageBuffer = fs.readFileSync(req.file.path);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `Analyze this medical image and provide a brief, helpful response. Focus on what you can observe and suggest if a doctor consultation might be needed. Be cautious and don't make definitive medical diagnoses.`;
        
        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: imageBuffer.toString('base64'),
              mimeType: req.file.mimetype
            }
          }
        ]);
        
        aiResponse = result.response.text();
      } catch (aiError) {
        console.error('AI analysis error:', aiError);
        aiResponse = "I can see you've uploaded an image, but I'm having trouble analyzing it right now. Please describe what you're showing me, or consider consulting with a doctor for a proper evaluation.";
      }
    } else {
      aiResponse = `I can see you've uploaded a document (${req.file.originalname}). For document analysis, please describe the content or specific questions you have about it. I can help guide you based on your description.`;
    }

    // Save both messages to database
    await Message.bulkCreate([
      {
        sessionId: sessionId,
        sender: 'user',
        text: userMessageText
      },
      {
        sessionId: sessionId,
        sender: 'ai',
        text: aiResponse
      }
    ]);

    res.json({
      message: 'File uploaded successfully',
      file: fileUpload,
      aiResponse: aiResponse
    });

  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({ message: 'Error uploading file', error: err.message });
  }
}; 