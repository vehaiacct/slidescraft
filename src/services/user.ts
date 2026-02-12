import { supabase, UserProfile } from './supabase';

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) return null;
    return data;
}

export async function createUserProfile(userId: string, email: string, username: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .insert([
            { id: userId, email, username, credits: 5, is_admin: false }
        ])
        .select()
        .single();

    if (error) {
        console.error('Error creating profile:', error);
        return null;
    }
    return data;
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .single();

    if (error) return true; // Most likely doesn't exist
    return !data;
}

export async function transferCredits(senderId: string, receiverUsername: string, amount: number): Promise<{ success: boolean; message: string }> {
    // 1. Find receiver
    const { data: receiver, error: receiverError } = await supabase
        .from('profiles')
        .select('id, credits')
        .eq('username', receiverUsername.toLowerCase())
        .single();

    if (receiverError || !receiver) {
        return { success: false, message: 'User not found.' };
    }

    if (receiver.id === senderId) {
        return { success: false, message: 'You cannot send credits to yourself.' };
    }

    // 2. Atomic transfer using Supabase RPC (recommended) or a transaction logic
    // For simplicity here, we'll do it in two steps but ideally it's an RPC function

    // Check sender balance first
    const { data: sender, error: senderError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', senderId)
        .single();

    if (senderError || !sender || sender.credits < amount) {
        return { success: false, message: 'Insufficient credits.' };
    }

    // Perform transfer
    const { error: updateSenderError } = await supabase
        .from('profiles')
        .update({ credits: sender.credits - amount })
        .eq('id', senderId);

    if (updateSenderError) return { success: false, message: 'Transfer failed.' };

    const { error: updateReceiverError } = await supabase
        .from('profiles')
        .update({ credits: receiver.credits + amount })
        .eq('id', receiver.id);

    if (updateReceiverError) {
        // Rollback sender (basic manual rollback)
        await supabase.from('profiles').update({ credits: sender.credits }).eq('id', senderId);
        return { success: false, message: 'Transfer failed.' };
    }

    // Log transaction
    await supabase.from('transactions').insert([
        { sender_id: senderId, receiver_id: receiver.id, amount, type: 'transfer' }
    ]);

    return { success: true, message: 'Transfer successful!' };
}
