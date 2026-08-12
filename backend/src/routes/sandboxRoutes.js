import express from 'express';
import { supabase } from '../config/db.js';

const router = express.Router();

// GET all pending actions
router.get('/pending', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('action_sandbox_logs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ pending: data || [] });
  } catch (error) {
    console.error('Error fetching pending sandbox actions:', error);
    res.status(500).json({ error: 'Failed to fetch pending actions' });
  }
});

// POST to approve or reject an action
router.post('/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rolled_back'

    if (!['approved', 'rolled_back'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const { data, error } = await supabase
      .from('action_sandbox_logs')
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // If approved, you would normally execute the payload here.
    // E.g., if action_type === 'EMAIL_PARENT', send email via Resend/SMTP.
    
    res.json({ success: true, action: data });
  } catch (error) {
    console.error('Error reviewing sandbox action:', error);
    res.status(500).json({ error: 'Failed to review action' });
  }
});

export default router;
