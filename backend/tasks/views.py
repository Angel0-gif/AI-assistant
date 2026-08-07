from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    """CRUD complet pour les tâches de l'utilisateur connecté."""
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Task.objects.filter(user=self.request.user)
        is_done = self.request.query_params.get("is_done")
        if is_done is not None:
            qs = qs.filter(is_done=is_done.lower() == "true")
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def toggle(self, request, pk=None):
        """Bascule rapidement l'état fait/pas fait d'une tâche."""
        task = self.get_object()
        task.is_done = not task.is_done
        task.save(update_fields=["is_done", "updated_at"])
        return Response(TaskSerializer(task).data)
