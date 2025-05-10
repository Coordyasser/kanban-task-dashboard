
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTasks } from "@/contexts/task";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { TaskStatus } from "@/types";

interface UseTaskFormProps {
  taskId?: string;
}

export const useTaskForm = ({ taskId }: UseTaskFormProps) => {
  const navigate = useNavigate();
  const { addTask, getTaskById, updateTask } = useTasks();
  const { currentUser } = useAuth();
  const isEditing = !!taskId;
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [observations, setObservations] = useState("");
  
  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      toast.error("Apenas administradores podem criar ou editar tarefas");
      navigate("/dashboard");
      return;
    }
    
    if (isEditing && taskId) {
      const task = getTaskById(taskId);
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setUnit(task.unit);
        setSelectedAssignees(task.assignees);
        setStartDate(task.startDate);
        setEndDate(task.endDate);
        setStatus(task.status);
        setObservations(task.observations || "");
      } else {
        toast.error("Tarefa não encontrada");
        navigate("/tasks");
      }
    }
  }, [taskId, isEditing, getTaskById, navigate, currentUser]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedAssignees.length === 0) {
      toast.error("Por favor, atribua a tarefa a pelo menos um usuário");
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      toast.error("A data final não pode ser anterior à data inicial");
      return;
    }
    
    const taskData = {
      title,
      description,
      unit,
      assignees: selectedAssignees,
      startDate,
      endDate,
      status,
      observations,
    };
    
    if (isEditing && taskId) {
      updateTask(taskId, taskData);
      toast.success("Tarefa atualizada com sucesso");
    } else {
      addTask(taskData);
      toast.success("Tarefa criada com sucesso");
    }
    
    navigate("/tasks");
  };

  return {
    isEditing,
    title, setTitle,
    description, setDescription,
    unit, setUnit,
    selectedAssignees, setSelectedAssignees,
    startDate, setStartDate,
    endDate, setEndDate,
    status, setStatus,
    observations, setObservations,
    handleSubmit
  };
};
