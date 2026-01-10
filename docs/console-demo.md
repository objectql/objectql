# ObjectQL Visual Console - Demo Screenshot

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║ ObjectQL Visual Console - Press q to quit, ? for help                        ║
╠════════════════╦══════════════════════════════════════════════════════════════╣
║ Objects        ║ projects (Page 1/2, Total: 3)                               ║
║                ╠══════════════════════════════════════════════════════════════╣
║ > projects     ║ # │ _id      │ name                │ status      │ priority ║
║   tasks        ║───┼──────────┼─────────────────────┼─────────────┼──────────║
║   users        ║ 1 │ PROJ-001 │ Website Redesign    │ in_progress │ high     ║
║   notes        ║ 2 │ PROJ-002 │ Mobile App Dev      │ planned     │ normal   ║
║                ║ 3 │ PROJ-003 │ API Modernization   │ completed   │ high     ║
║                ║                                                              ║
║                ║                                                              ║
║                ║                                                              ║
║                ║                                                              ║
║                ║                                                              ║
║                ║                                                              ║
╠════════════════╩══════════════════════════════════════════════════════════════╣
║ ↑↓ Navigate │ Enter: View Detail │ n: Next Page │ p: Prev Page │ r: Refresh  ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

## Selecting a Task Record

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║ ObjectQL Visual Console - Press q to quit, ? for help                        ║
╠════════════════╦══════════════════════════════════════════════════════════════╣
║ Objects        ║ tasks (Page 1/1, Total: 5)                                  ║
║                ╠══════════════════════════════════════════════════════════════╣
║   projects     ║ # │ _id      │ name                      │ project  │ comp…║
║ > tasks        ║───┼──────────┼───────────────────────────┼──────────┼──────║
║   users        ║ 1 │ TASK-001 │ Design Homepage Mockups   │ PROJ-001 │ true ║
║   notes        ║ 2 │ TASK-002 │ Implement Responsive      │ PROJ-001 │ false║
║                ║ 3 │ TASK-003 │ Setup CI/CD Pipeline      │ PROJ-001 │ false║
║                ║ 4 │ TASK-004 │ Research Mobile Frameworks│ PROJ-002 │ true ║
║                ║ 5 │ TASK-005 │ Create App Wireframes     │ PROJ-002 │ false║
║                ║                                                              ║
║                ║                                                              ║
║                ║                                                              ║
╠════════════════╩══════════════════════════════════════════════════════════════╣
║ ↑↓ Navigate │ Enter: View Detail │ n: Next Page │ p: Prev Page │ r: Refresh  ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

## Detail View (Press Enter on a record)

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                             Record Detail                                     ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  _id: TASK-002                                                                ║
║                                                                               ║
║  name: Implement Responsive Layout                                            ║
║                                                                               ║
║  project: PROJ-001                                                            ║
║                                                                               ║
║  due_date: 2024-03-30                                                         ║
║                                                                               ║
║  completed: false                                                             ║
║                                                                               ║
║  priority: high                                                               ║
║                                                                               ║
║  assigned_to: Carlos Developer                                                ║
║                                                                               ║
║  estimated_hours: 80                                                          ║
║                                                                               ║
║                                                                               ║
║                                                                               ║
║                                                                               ║
║                         Press Escape or q to close                            ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

## Help Screen (Press ?)

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                 ObjectQL Visual Console - Help                                ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  Navigation:                                                                  ║
║    ↑/↓ or j/k    - Navigate up/down                                           ║
║    Tab           - Switch between panels                                      ║
║    q or Ctrl+C   - Quit                                                       ║
║                                                                               ║
║  Data Operations:                                                             ║
║    Enter         - View record detail                                         ║
║    r             - Refresh current data                                       ║
║    n             - Next page                                                  ║
║    p             - Previous page                                              ║
║                                                                               ║
║  Object Operations:                                                           ║
║    Select object from left sidebar                                            ║
║                                                                               ║
║                                                                               ║
║                                                                               ║
║                                                                               ║
║                         Press any key to close...                             ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

## Key Features Demonstrated

1. **Split-Pane Layout**: Object list on the left, data table on the right
2. **Pagination**: Shows current page and total records
3. **Visual Selection**: Current object/row is highlighted
4. **Keyboard Navigation**: All operations accessible via keyboard
5. **Detail View**: Clean overlay for viewing complete record data
6. **Help System**: Comprehensive help accessible with single key
7. **Status Bar**: Shows available commands at bottom

## Usage Flow

1. Start console: `objectql console`
2. Use ↑↓ to select object (projects, tasks, etc.)
3. Browse records in the data table
4. Press Enter to view details
5. Press Escape to return
6. Use n/p for pagination
7. Press q to quit

## Benefits over REPL

- **Visual**: See data in a structured table format
- **Intuitive**: No need to remember command syntax
- **Discoverable**: All features visible and accessible
- **Mouse Support**: Optional mouse navigation
- **Beginner Friendly**: Lower learning curve than REPL
