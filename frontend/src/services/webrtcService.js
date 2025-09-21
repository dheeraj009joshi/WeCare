class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.videoCallId = null;
    this.role = null; // 'user' or 'doctor'
    this.onRemoteStream = null;
    this.onConnectionStateChange = null;
    this.onIceCandidate = null;
    this.heartbeatInterval = null;
    this.connectionCheckInterval = null;
    this.isConnected = false;
  }

  // Initialize WebRTC connection
  async initialize(videoCallId, role, onRemoteStream, onConnectionStateChange, onIceCandidate) {
    this.videoCallId = videoCallId;
    this.role = role;
    this.onRemoteStream = onRemoteStream;
    this.onConnectionStateChange = onConnectionStateChange;
    this.onIceCandidate = onIceCandidate;

    try {
      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      // Create RTCPeerConnection
      this.peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Add local stream tracks to peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      // Handle remote stream
      this.peerConnection.ontrack = (event) => {
        this.remoteStream = event.streams[0];
        if (this.onRemoteStream) {
          this.onRemoteStream(this.remoteStream);
        }
      };

      // Handle connection state changes
      this.peerConnection.onconnectionstatechange = () => {
        const state = this.peerConnection.connectionState;
        this.isConnected = state === 'connected';
        
        if (this.onConnectionStateChange) {
          this.onConnectionStateChange(state);
        }

        // Start heartbeat when connected
        if (state === 'connected' && !this.heartbeatInterval) {
          this.startHeartbeat();
        } else if (state !== 'connected' && this.heartbeatInterval) {
          this.stopHeartbeat();
        }
      };

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate && this.onIceCandidate) {
          this.onIceCandidate(event.candidate);
        }
      };

      // Start connection monitoring
      this.startConnectionMonitoring();

      return this.localStream;
    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      throw error;
    }
  }

  // Start heartbeat to keep video call alive
  startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/video-call/${this.videoCallId}/heartbeat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('doctorToken')}`
          },
          body: JSON.stringify({
            userId: this.getUserId(),
            role: this.role
          })
        });

        if (!response.ok) {
          console.warn('Heartbeat failed, connection might be stale');
        }
      } catch (error) {
        console.error('Error sending heartbeat:', error);
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  // Stop heartbeat
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Start connection monitoring
  startConnectionMonitoring() {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
    }

    this.connectionCheckInterval = setInterval(async () => {
      if (!this.peerConnection) return;

      const state = this.peerConnection.connectionState;
      
      // If connection is failed or disconnected, try to reconnect
      if (state === 'failed' || state === 'disconnected') {
        console.log('WebRTC connection lost, attempting to reconnect...');
        await this.reconnect();
      }
    }, 10000); // Check every 10 seconds
  }

  // Stop connection monitoring
  stopConnectionMonitoring() {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }
  }

  // Attempt to reconnect
  async reconnect() {
    try {
      if (this.peerConnection) {
        this.peerConnection.close();
      }

      // Reinitialize the connection
      await this.initialize(this.videoCallId, this.role, this.onRemoteStream, this.onConnectionStateChange, this.onIceCandidate);
      
      // Try to create and send offer again
      if (this.role === 'user') {
        await this.createOffer();
      }
    } catch (error) {
      console.error('Reconnection failed:', error);
    }
  }

  // Create and send offer
  async createOffer() {
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      // Send offer to signaling server
      const response = await fetch(`http://localhost:5000/api/video-call/${this.videoCallId}/offer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('doctorToken')}`
        },
        body: JSON.stringify({
          offer: offer,
          from: this.role
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send offer');
      }

      return offer;
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  // Handle incoming offer
  async handleOffer(offer) {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      // Send answer to signaling server
      const response = await fetch(`http://localhost:5000/api/video-call/${this.videoCallId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('doctorToken')}`
        },
        body: JSON.stringify({
          answer: answer,
          from: this.role
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send answer');
      }

      return answer;
    } catch (error) {
      console.error('Error handling offer:', error);
      throw error;
    }
  }

  // Handle incoming answer
  async handleAnswer(answer) {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error handling answer:', error);
      throw error;
    }
  }

  // Handle ICE candidate
  async handleICECandidate(candidate) {
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
      throw error;
    }
  }

  // Send ICE candidate to signaling server
  async sendICECandidate(candidate) {
    try {
      const response = await fetch(`http://localhost:5000/api/video-call/${this.videoCallId}/ice-candidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('doctorToken')}`
        },
        body: JSON.stringify({
          candidate: candidate,
          from: this.role
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send ICE candidate');
      }
    } catch (error) {
      console.error('Error sending ICE candidate:', error);
      throw error;
    }
  }

  // Get signaling data for participant
  async pollSignalingData() {
    try {
      const response = await fetch(`http://localhost:5000/api/video-call/${this.videoCallId}/signaling/${this.role}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('doctorToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get signaling data');
      }

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error polling signaling data:', error);
      return null;
    }
  }

  // Join video call
  async joinVideoCall() {
    try {
      const response = await fetch(`http://localhost:5000/api/video-call/${this.videoCallId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('doctorToken')}`
        },
        body: JSON.stringify({
          userId: this.getUserId(),
          role: this.role
        })
      });

      if (!response.ok) {
        throw new Error('Failed to join video call');
      }

      return await response.json();
    } catch (error) {
      console.error('Error joining video call:', error);
      throw error;
    }
  }

  // Leave video call
  async leaveVideoCall() {
    try {
      console.log(`📞 Leaving video call: ${this.videoCallId}`);
      
      if (!this.videoCallId) {
        console.warn('⚠️ No video call ID to leave');
        return { success: true, message: 'No active video call' };
      }

      const response = await fetch(`http://localhost:5000/api/video-call/${this.videoCallId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('doctorToken')}`
        },
        body: JSON.stringify({
          userId: this.getUserId(),
          role: this.role
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to leave video call: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Successfully left video call:', result);
      return result;
    } catch (error) {
      console.error('❌ Error leaving video call:', error);
      throw error;
    }
  }

  // End video call explicitly
  async endVideoCall() {
    try {
      console.log(`🔴 Ending video call: ${this.videoCallId}`);
      
      if (!this.videoCallId) {
        console.warn('⚠️ No video call ID to end');
        return { success: true, message: 'No active video call' };
      }

      const response = await fetch(`http://localhost:5000/api/video-call/${this.videoCallId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('doctorToken')}`
        },
        body: JSON.stringify({
          userId: this.getUserId(),
          role: this.role
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to end video call: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Successfully ended video call:', result);
      return result;
    } catch (error) {
      console.error('❌ Error ending video call:', error);
      throw error;
    }
  }

  // Get user ID from token
  getUserId() {
    const token = localStorage.getItem('token') || localStorage.getItem('doctorToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId || payload.id;
      } catch (error) {
        console.error('Error parsing token:', error);
        return null;
      }
    }
    return null;
  }

  // Cleanup
  cleanup() {
    console.log('🧹 Cleaning up WebRTC service...');
    
    try {
      // Stop all local stream tracks
      if (this.localStream) {
        console.log('🎥 Stopping local stream tracks...');
        this.localStream.getTracks().forEach(track => {
          track.stop();
          console.log(`🛑 Stopped track: ${track.kind}`);
        });
        this.localStream = null;
      }

      // Close peer connection
      if (this.peerConnection) {
        console.log('🔌 Closing peer connection...');
        this.peerConnection.close();
        this.peerConnection = null;
      }

      // Clear remote stream
      this.remoteStream = null;

      // Stop heartbeat
      this.stopHeartbeat();

      // Stop connection monitoring
      this.stopConnectionMonitoring();

      // Clear video call ID and role
      this.videoCallId = null;
      this.role = null;

      console.log('✅ WebRTC service cleanup completed');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }

  // Get local stream
  getLocalStream() {
    return this.localStream;
  }

  // Get remote stream
  getRemoteStream() {
    return this.remoteStream;
  }

  // Get peer connection
  getPeerConnection() {
    return this.peerConnection;
  }
}

export default WebRTCService; 