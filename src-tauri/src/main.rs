#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Manager;
use rusqlite::{Connection, Result};
use serde::{Serialize, Deserialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize)]
struct JobApplication {
    id: String,
    date_applied: String,
    job_title: String,
    company_name: String,
    url: String,
    status: String,
    resume_name: String,
    has_cover_letter: bool,
    cover_letter_name: Option<String>,
    cover_letter_content: Option<String>,
    job_type: String,
}

fn init_db() -> Result<Connection> {
    let conn = Connection::open("src-tauri/data/jobs.db")?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS jobs (
            id TEXT PRIMARY KEY,
            date_applied TEXT NOT NULL,
            job_title TEXT NOT NULL,
            company_name TEXT NOT NULL,
            url TEXT,
            status TEXT NOT NULL,
            resume_name TEXT,
            has_cover_letter INTEGER NOT NULL,
            cover_letter_name TEXT,
            cover_letter_content TEXT,
            job_type TEXT
        )",
        [],
    )?;
    Ok(conn)
}

#[tauri::command]
fn add_job(job: JobApplication) -> Result<String, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO jobs (id, date_applied, job_title, company_name, url, status, resume_name, has_cover_letter, cover_letter_name, cover_letter_content, job_type)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        (
            job.id,
            job.date_applied,
            job.job_title,
            job.company_name,
            job.url,
            job.status,
            job.resume_name,
            job.has_cover_letter as i32,
            job.cover_letter_name,
            job.cover_letter_content,
            job.job_type,
        ),
    ).map_err(|e| e.to_string())?;
    Ok(job.id)
}

#[tauri::command]
fn get_jobs() -> Result<Vec<JobApplication>, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, date_applied, job_title, company_name, url, status, resume_name, has_cover_letter, cover_letter_name, cover_letter_content, job_type FROM jobs").map_err(|e| e.to_string())?;
    let job_iter = stmt
        .query_map([], |row| {
            Ok(JobApplication {
                id: row.get(0)?,
                date_applied: row.get(1)?,
                job_title: row.get(2)?,
                company_name: row.get(3)?,
                url: row.get(4)?,
                status: row.get(5)?,
                resume_name: row.get(6)?,
                has_cover_letter: row.get::<_, i32>(7)? != 0,
                cover_letter_name: row.get(8)?,
                cover_letter_content: row.get(9)?,
                job_type: row.get(10)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut jobs = Vec::new();
    for job in job_iter {
        jobs.push(job.map_err(|e| e.to_string())?);
    }
    Ok(jobs)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![add_job, get_jobs])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
