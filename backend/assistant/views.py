from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Conversation, Message
from .serializers import ConversationSerializer, ChatRequestSerializer
from .gemini_client import ask_gemini, GeminiError


class ConversationListView(generics.ListAPIView):
    """Liste des conversations de l'utilisateur (historique)."""
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user)


class ConversationDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user)


class ChatView(APIView):
    """
    Endpoint principal du chat.
    POST { "conversation_id": <int|null>, "message": "..." }
    -> crée la conversation si besoin, appelle Gemini, sauvegarde les deux messages.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_message = serializer.validated_data["message"]
        conversation_id = serializer.validated_data.get("conversation_id")

        if conversation_id:
            conversation = Conversation.objects.filter(
                id=conversation_id, user=request.user
            ).first()
            if conversation is None:
                return Response({"detail": "Conversation introuvable."}, status=404)
        else:
            title = user_message[:50]
            conversation = Conversation.objects.create(user=request.user, title=title)

        history = [
            {"role": m.role, "content": m.content}
            for m in conversation.messages.all()
        ]

        Message.objects.create(conversation=conversation, role="user", content=user_message)

        try:
            reply_text = ask_gemini(history, user_message)
        except GeminiError as e:
            return Response({"detail": str(e)}, status=status.HTTP_502_BAD_GATEWAY)

        assistant_msg = Message.objects.create(
            conversation=conversation, role="assistant", content=reply_text
        )

        return Response({
            "conversation_id": conversation.id,
            "reply": assistant_msg.content,
            "created_at": assistant_msg.created_at,
        })
