import React, { useState, useEffect } from 'react';
import { useAuth, useReview } from '../context';
import { toast } from 'react-hot-toast';

function ProductComments({ productId }) {
  const { user, isAuthenticated } = useAuth();
  const { 
    getProductComments, 
    addProductComment, 
    reportContent,
    reviewLoading 
  } = useReview();
  
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [reportingComment, setReportingComment] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar comentarios al montar el componente
  useEffect(() => {
    const loadComments = async () => {
      try {
        setLoading(true);
        const commentsData = await getProductComments(productId);
        setComments(commentsData || []);
      } catch (error) {
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadComments();
    }
  }, [productId, getProductComments]);

  // Separar comentarios principales y respuestas
  const mainComments = comments.filter(comment => !comment.parentCommentId);
  const replies = comments.filter(comment => comment.parentCommentId);

  const getRepliesForComment = (commentId) => {
    return replies.filter(reply => reply.parentCommentId === commentId);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      toast.error('Debes iniciar sesión para hacer una pregunta');
      return;
    }
    
    if (newComment.trim().length < 5) {
      toast.error('El comentario debe tener al menos 5 caracteres');
      return;
    }    try {
      const result = await addProductComment(productId, newComment.trim());
      if (result.success) {
        setComments(prev => [result.comment, ...prev]);
        setNewComment('');
        toast.success('Comentario agregado exitosamente');
      } else {
        toast.error(result.message || 'Error al agregar comentario');
      }
    } catch (error) {
      toast.error('Error al agregar comentario');
    }
  };

  const handleAddReply = async (parentId) => {
    if (!isAuthenticated()) {
      toast.error('Debes iniciar sesión para responder');
      return;
    }
    
    if (replyText.trim().length < 5) {
      toast.error('La respuesta debe tener al menos 5 caracteres');
      return;
    }    try {
      const result = await addProductComment(productId, replyText.trim(), parentId);
      if (result.success) {
        setComments(prev => [result.comment, ...prev]);
        setReplyText('');
        setReplyingTo(null);
        toast.success('Respuesta agregada exitosamente');
      } else {
        toast.error(result.message || 'Error al agregar respuesta');
      }
    } catch (error) {
      toast.error('Error al agregar respuesta');
    }
  };

  const handleReport = async (comment) => {
    if (!reportReason.trim()) {
      toast.error('Por favor selecciona una razón para el reporte');
      return;
    }

    try {
      const result = await reportContent(comment._id, 'comment', reportReason);
      if (result.success) {
        toast.success('Comentario reportado exitosamente');
      } else {
        toast.error(result.message || 'Error al reportar comentario');
      }
    } catch (error) {
      toast.error('Error al reportar comentario');
    }

    setReportingComment(null);
    setReportReason('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || reviewLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Cargando comentarios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">
        Preguntas y comentarios ({mainComments.length})
      </h3>

      {/* Formulario para nuevo comentario */}
      {isAuthenticated() ? (
        <form onSubmit={handleAddComment} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Haz una pregunta sobre este producto..."
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            minLength={5}
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              Mínimo 5 caracteres ({newComment.length}/5)
            </p>
            <button
              type="submit"
              disabled={newComment.trim().length < 5 || reviewLoading}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {reviewLoading ? 'Enviando...' : 'Enviar pregunta'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-gray-600">
            <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Inicia sesión
            </a> para hacer una pregunta
          </p>
        </div>
      )}

      {/* Lista de comentarios */}
      <div className="space-y-4">
        {mainComments.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">💬</div>
            <p className="text-gray-600">
              Aún no hay preguntas. ¡Sé el primero en preguntar!
            </p>
          </div>
        ) : (
          mainComments.map((comment) => {
            const commentReplies = getRepliesForComment(comment._id);
            
            return (
              <div key={comment._id} className="bg-white border border-gray-200 rounded-lg p-4">
                {/* Comentario principal */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {(comment.userName && typeof comment.userName === 'string' && comment.userName.length > 0) 
                      ? comment.userName.charAt(0).toUpperCase() 
                      : '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900">{comment.userName}</h4>
                      {comment.userType === 'buyer' && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          Cliente
                        </span>
                      )}
                      <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-gray-700 mb-2">{comment.comment}</p>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setReplyingTo(comment._id)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Responder
                      </button>
                      <button
                        onClick={() => setReportingComment(comment._id)}
                        className="text-sm text-gray-500 hover:text-red-600"
                      >
                        ⚠️ Reportar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Formulario de respuesta */}
                {replyingTo === comment._id && (
                  <div className="mt-4 ml-11">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Escribe tu respuesta..."
                      rows={2}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      minLength={5}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleAddReply(comment._id)}
                        disabled={replyText.trim().length < 5 || reviewLoading}
                        className="bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {reviewLoading ? 'Enviando...' : 'Responder'}
                      </button>
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                        className="border border-gray-300 py-1 px-3 rounded text-sm hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Respuestas */}
                {commentReplies.length > 0 && (
                  <div className="mt-4 ml-11 space-y-3">
                    {commentReplies.map((reply) => (
                      <div key={reply._id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {(reply.userName && typeof reply.userName === 'string' && reply.userName.length > 0) 
                              ? reply.userName.charAt(0).toUpperCase() 
                              : '?'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h5 className="text-sm font-medium text-gray-900">{reply.userName}</h5>
                              {reply.userType === 'store' && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  Vendedor
                                </span>
                              )}
                              <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
                            </div>
                            <p className="text-sm text-gray-700">{reply.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal de reporte */}
      {reportingComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Reportar comentario</h3>
            <div className="space-y-3 mb-4">
              {['Contenido inapropiado', 'Spam', 'Información falsa', 'Lenguaje ofensivo', 'Otro'].map((reason) => (
                <label key={reason} className="flex items-center">
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={reportReason === reason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="mr-2"
                  />
                  {reason}
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleReport(comments.find(c => c._id === reportingComment))}
                disabled={!reportReason}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
              >
                Enviar reporte
              </button>
              <button
                onClick={() => {
                  setReportingComment(null);
                  setReportReason('');
                }}
                className="flex-1 border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductComments;
