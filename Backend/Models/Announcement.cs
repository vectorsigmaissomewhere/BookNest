namespace Backend.Models;

public class Announcement
{
    public int AnnouncementId { get; set; }
    public string Message { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}