using System;
using System.Collections.Generic;

namespace StudentManagement.Models;

public partial class Timetable
{
    public int TimetableId { get; set; }

    public int ClassId { get; set; }

    public int SubjectId { get; set; }

    public int TeacherId { get; set; }

    public int SemesterId { get; set; }

    public string? DayOfWeek { get; set; }

    public int? Period { get; set; }

    public string? RoomNumber { get; set; }

    public virtual Class Class { get; set; } = null!;

    public virtual Semester Semester { get; set; } = null!;

    public virtual Subject Subject { get; set; } = null!;

    public virtual Teacher Teacher { get; set; } = null!;
}
