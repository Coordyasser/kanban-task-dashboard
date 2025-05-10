
import { useParams } from "react-router-dom";
import { useTaskForm } from "@/hooks/useTaskForm";
import TaskFormLayout from "@/components/forms/TaskFormLayout";
import TaskBasicInfo from "@/components/forms/TaskBasicInfo";
import TaskDateSelection from "@/components/forms/TaskDateSelection";
import TaskStatusSelection from "@/components/forms/TaskStatusSelection";
import TaskAssigneeSelection from "@/components/forms/TaskAssigneeSelection";
import TaskObservationsField from "@/components/forms/TaskObservationsField";

const TaskForm = () => {
  const { id } = useParams();
  const {
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
  } = useTaskForm({ taskId: id });
  
  return (
    <TaskFormLayout 
      title={isEditing ? "Editar Tarefa" : "Criar Nova Tarefa"}
      onSubmit={handleSubmit}
    >
      <TaskBasicInfo 
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        unit={unit}
        setUnit={setUnit}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TaskDateSelection 
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
        
        {isEditing && (
          <TaskStatusSelection 
            status={status}
            setStatus={setStatus}
          />
        )}
      </div>
      
      <TaskAssigneeSelection 
        selectedAssignees={selectedAssignees}
        setSelectedAssignees={setSelectedAssignees}
      />
      
      {isEditing && (
        <TaskObservationsField 
          observations={observations}
          setObservations={setObservations}
        />
      )}
    </TaskFormLayout>
  );
};

export default TaskForm;
