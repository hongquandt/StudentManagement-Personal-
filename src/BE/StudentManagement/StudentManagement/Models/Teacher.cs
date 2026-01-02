using System;
using System.Collections.Generic;

namespace StudentManagement.Models;

public partial class Teacher
{
    public int TeacherId { get; set; }

    public int UserId { get; set; }

    public string FullName { get; set; } = null!;

    public string? Specialization { get; set; }

    public string? Phone { get; set; }

    public virtual ICollection<Class> Classes { get; set; } = new List<Class>();

    public virtual ICollection<TeacherCertificate> TeacherCertificates { get; set; } = new List<TeacherCertificate>();

    public virtual ICollection<TeachingAssignment> TeachingAssignments { get; set; } = new List<TeachingAssignment>();

    public virtual ICollection<Timetable> Timetables { get; set; } = new List<Timetable>();

    public virtual ICollection<TeacherRequest> TeacherRequests { get; set; } = new List<TeacherRequest>();

    public virtual User User { get; set; } = null!;
}
