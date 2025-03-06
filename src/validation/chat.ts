import { body, validationResult } from 'express-validator';
export const requestValidator=async(req,res,next)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
}

export const newGroupChatValidator = [
    body('chatName').not().isEmpty().withMessage('chatName is required'),
    body('members').not().isEmpty().withMessage('members are required'),
    body('file').not().isEmpty().withMessage('file is required'),
    body('members').isArray({ min: 3 }).withMessage('members must be at least 3')
  ];

export const changeStatusValidator = [
  body('chatId').not().isEmpty().withMessage('chatId is required'),
  body('requestId').not().isEmpty().withMessage('requestId is required'),
  body('status').not().isEmpty().withMessage('status is required'),
  body('status').isIn(['Accept', 'Reject', 'Block', 'Pending']).withMessage('status must be either "Accept", "Reject", "Block" or "Pending"')
];



  
  export const getValidator = [
    body('id').not().isEmpty().withMessage('id is required')
  ];


  export const sendMessageValidator = [
    body('chatId').not().isEmpty().withMessage('chatId is required'),
    body('message').not().isEmpty().withMessage('message is required'),
    body('senderId').not().isEmpty().withMessage('senderId is required'),
    body('receiverId').not().isEmpty().withMessage('receiverId is required')
  ];
  export const sendAttachmentValidator = [
    body('chatId').not().isEmpty().withMessage('chatId is required'),
    body('file').not().isEmpty().withMessage('file is required'),
    body('senderId').not().isEmpty().withMessage('senderId is required'),
    body('receiverId').not().isEmpty().withMessage('receiverId is required')
  ];
  export const getChatValidator = [
    body('chatId').not().isEmpty().withMessage('chatId is required')
  ];
  export const getAllChatsValidator = [
    body('id').not().isEmpty().withMessage('id is required')
  ];
  export const getAllMessagesValidator = [
    body('chatId').not().isEmpty().withMessage('chatId is required'),
    body('id').not().isEmpty().withMessage('id is required')
  ];

export const deleteMessageValidator = [
    body('chatId').not().isEmpty().withMessage('chatId is required'),
    body('messageId').not().isEmpty().withMessage('messageId is required'),
    body('id').not().isEmpty().withMessage('id is required')
  ];

export const updateMessageValidator = [
    body('chatId').not().isEmpty().withMessage('chatId is required'),
    body('messageId').not().isEmpty().withMessage('messageId is required'),
    body('id').not().isEmpty().withMessage('id is required'),
    body('message').not().isEmpty().withMessage('message is required')
  ];


export const deleteChatValidator = [
    body('chatId').not().isEmpty().withMessage('chatId is required'),
    body('id').not().isEmpty().withMessage('id is required')
  ];