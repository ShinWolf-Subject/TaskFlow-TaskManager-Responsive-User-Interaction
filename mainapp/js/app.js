    $(document).ready(function() {
      let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      let currentFilter = 'all';
      
      // Initialize
      renderTasks();
      updateStats();
      
      // Dark mode toggle
      $('#darkModeToggle').click(function() {
        $('body').toggleClass('dark');
        const icon = $(this).find('i');
        
        if ($('body').hasClass('dark')) {
          icon.removeClass('fa-moon').addClass('fa-sun');
        } else {
          icon.removeClass('fa-sun').addClass('fa-moon');
        }
        
        localStorage.setItem('darkMode', $('body').hasClass('dark'));
      });
      
      // Load dark mode preference
      if (localStorage.getItem('darkMode') === 'true') {
        $('body').addClass('dark');
        $('#darkModeToggle i').removeClass('fa-moon').addClass('fa-sun');
      }
      
      // Add task
      $('#taskForm').submit(function(e) {
        e.preventDefault();
        
        const task = {
          id: Date.now(),
          title: $('#taskTitle').val(),
          category: $('#taskCategory').val(),
          priority: $('#taskPriority').val(),
          dueDate: $('#taskDueDate').val(),
          completed: false,
          createdAt: new Date().toISOString()
        };
        
        tasks.unshift(task);
        saveTasks();
        renderTasks();
        updateStats();
        
        // Reset form
        $('#taskTitle').val('').focus();
        $('#taskCategory, #taskPriority, #taskDueDate').val('');
        
        showNotification('Task added successfully!', 'success');
      });
      
      // Filter buttons
      $('.filter-btn').click(function() {
        $('.filter-btn').removeClass('active');
        $(this).addClass('active');
        
        currentFilter = $(this).data('filter');
        renderTasks();
      });
      
      // Render tasks
      function renderTasks() {
        const filteredTasks = filterTasks(tasks, currentFilter);
        const tasksList = $('#tasksList');
        const emptyState = $('#emptyState');
        
        tasksList.empty();
        
        if (filteredTasks.length === 0) {
          emptyState.removeClass('hidden');
        } else {
          emptyState.addClass('hidden');
          
          filteredTasks.forEach((task) => {
            const taskElement = createTaskElement(task);
            tasksList.append(taskElement);
          });
        }
      }
      
      // Create task element
      function createTaskElement(task) {
        const categoryIcons = {
          work: 'fa-briefcase',
          personal: 'fa-user',
          shopping: 'fa-shopping-cart',
          health: 'fa-heartbeat',
          other: 'fa-tag'
        };
        
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
        const overdueClass = isOverdue ? 'text-red-600 font-medium' : '';
        
        return $(`
                    <div class="task-item priority-${task.priority} ${task.completed ? 'completed' : ''} fade-in">
                        <div class="flex items-start justify-between gap-4">
                            <div class="flex items-start gap-3 flex-1 min-w-0">
                                <input type="checkbox" class="github-checkbox task-checkbox mt-1"
                                       data-id="${task.id}" ${task.completed ? 'checked' : ''}>
                                <div class="flex-1 min-w-0">
                                    <h3 class="font-medium text-base mb-2 ${task.completed ? 'line-through' : ''}" style="color: var(--text-default);">${task.title}</h3>
                                    <div class="flex items-center gap-3 flex-wrap">
                                        <span class="category-badge category-${task.category}">
                                            <i class="fas ${categoryIcons[task.category]} mr-1"></i>${task.category}
                                        </span>
                                        <span class="priority-indicator">${task.priority}</span>
                                        ${task.dueDate ? `
                                            <span class="text-sm ${overdueClass}" style="color: var(--text-muted);">
                                                <i class="far fa-calendar mr-1"></i>${formatDate(task.dueDate)}
                                            </span>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                            <button class="github-btn github-btn-danger delete-task" data-id="${task.id}" title="Delete task">
                                <i class="fas fa-trash text-sm"></i>
                            </button>
                        </div>
                    </div>
                `);
      }
      
      // Toggle task completion
      $(document).on('change', '.task-checkbox', function() {
        const taskId = parseInt($(this).data('id'));
        const task = tasks.find(t => t.id === taskId);
        
        if (task) {
          task.completed = !task.completed;
          saveTasks();
          renderTasks();
          updateStats();
          
          showNotification(
            task.completed ? 'Task completed!' : 'Task marked as active',
            task.completed ? 'success' : 'info'
          );
        }
      });
      
      // Delete task
      $(document).on('click', '.delete-task', function() {
        const taskId = parseInt($(this).data('id'));
        
        if (confirm('Are you sure you want to delete this task?')) {
          tasks = tasks.filter(t => t.id !== taskId);
          saveTasks();
          renderTasks();
          updateStats();
          
          showNotification('Task deleted', 'error');
        }
      });
      
      // Filter tasks
      function filterTasks(tasks, filter) {
        switch (filter) {
          case 'active':
            return tasks.filter(t => !t.completed);
          case 'completed':
            return tasks.filter(t => t.completed);
          case 'work':
          case 'personal':
          case 'shopping':
          case 'health':
          case 'other':
            return tasks.filter(t => t.category === filter);
          default:
            return tasks;
        }
      }
      
      // Update statistics
      function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        
        $('#totalTasks').text(total);
        $('#completedTasks').text(completed);
        $('#pendingTasks').text(pending);
      }
      
      // Save tasks to localStorage
      function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
      }
      
      // Format date
      function formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (date.toDateString() === today.toDateString()) {
          return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
          return 'Tomorrow';
        } else {
          return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
          });
        }
      }
      
      // Show notification
      function showNotification(message, type = 'success') {
        const notification = $(`
                    <div class="notification ${type}">
                        <div class="flex items-center gap-2">
                            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-times-circle' : 'fa-info-circle'}"></i>
                            <span class="font-medium">${message}</span>
                        </div>
                    </div>
                `);
        
        $('body').append(notification);
        
        setTimeout(() => {
          notification.css({
            transform: 'translateX(100%)',
            opacity: '0'
          });
          setTimeout(() => notification.remove(), 300);
        }, 3000);
      }
    });
