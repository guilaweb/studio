
"use client";

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, doc, getDoc, writeBatch, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import type { Conversation, Message, PointOfInterest, UserProfile } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// Hook to get all conversations for the current user
export const useConversations = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "conversations"),
            where("participants", "array-contains", user.uid),
            orderBy("updatedAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const convos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
            setConversations(convos);
            setLoading(false);
        });

        return () => unsubscribe();

    }, [user]);

    return { conversations, loading };
}

// Hook to get messages for a specific conversation
export const useMessages = (conversationId: string | null) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!conversationId) {
            setMessages([]);
            setLoading(false);
            return;
        }

        const messagesRef = collection(db, "conversations", conversationId, "messages");
        const q = query(messagesRef, orderBy("timestamp", "asc"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
            setMessages(msgs);
            setLoading(false);
        });

        return () => unsubscribe();

    }, [conversationId]);

    return { messages, loading };
}

// Function to send a message
export const sendMessage = async (conversationId: string, text: string, sender: UserProfile) => {
    if (!text.trim()) return;

    const messagesRef = collection(db, "conversations", conversationId, "messages");
    const conversationRef = doc(db, "conversations", conversationId);
    
    const newMessage: Omit<Message, 'id'> = {
        senderId: sender.uid,
        senderDisplayName: sender.displayName,
        text,
        timestamp: new Date().toISOString(),
        readBy: [sender.uid],
    };

    const batch = writeBatch(db);
    
    const messageDocRef = doc(collection(db, "conversations", conversationId, "messages"));
    batch.set(messageDocRef, newMessage);

    batch.update(conversationRef, {
        lastMessage: newMessage,
        updatedAt: new Date().toISOString(),
    });

    await batch.commit();
}


// Function to start or get a conversation
export const startConversation = async (property: PointOfInterest, buyer: UserProfile): Promise<{ conversationId: string | null; error?: string }> => {
    if (!property.authorId || !property.title) {
        return { conversationId: null, error: "Não é possível contactar o vendedor deste imóvel." };
    }
    
    if (property.authorId === buyer.uid) {
        return { conversationId: null, error: "Não pode iniciar uma conversa consigo mesmo." };
    }

    const conversationId = `${property.id}-${buyer.uid}`;
    const conversationRef = doc(db, "conversations", conversationId);
    
    try {
        const conversationSnap = await getDoc(conversationRef);

        if (!conversationSnap.exists()) {
            const sellerDoc = await getDoc(doc(db, "users", property.authorId));
            if (!sellerDoc.exists()) {
                 return { conversationId: null, error: "O vendedor deste imóvel não foi encontrado." };
            }
            const seller = sellerDoc.data() as UserProfile;
            
            const newConversation: Omit<Conversation, 'id'> = {
                propertyId: property.id,
                propertyTitle: property.title,
                propertyImage: property.updates?.find(u => u.photoDataUri)?.photoDataUri || property.files?.[0]?.url,
                participants: [property.authorId, buyer.uid],
                participantDetails: [
                    { uid: seller.uid, displayName: seller.displayName, photoURL: seller.photoURL },
                    { uid: buyer.uid, displayName: buyer.displayName, photoURL: buyer.photoURL }
                ],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            await setDoc(conversationRef, newConversation);
        }
        
        return { conversationId };

    } catch (error) {
        console.error("Error starting conversation: ", error);
        return { conversationId: null, error: "Não foi possível iniciar a conversa." };
    }
};
