using System;
using System.Collections.Generic;

namespace StudentManagement.Models;

public partial class Parent
{
    public int ParentId { get; set; }

    public int UserId { get; set; }

    public string FullName { get; set; } = null!;

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public virtual ICollection<StudentParent> StudentParents { get; set; } = new List<StudentParent>();

    public virtual User User { get; set; } = null!;
}
