using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Reflection;
using System.Threading;
using System.Windows.Forms;


[assembly: AssemblyTitle("NetLens")]
[assembly: AssemblyDescription("Offline Windows network traffic analyzer")]
[assembly: AssemblyProduct("NetLens")]
[assembly: AssemblyCompany("JesseBa1")]
[assembly: AssemblyCopyright("Copyright (c) 2026 JesseBa1")]
[assembly: AssemblyVersion("1.5.0.0")]
[assembly: AssemblyFileVersion("1.5.0.0")]
[assembly: AssemblyInformationalVersion("1.5.0")]

namespace NetLens
{
    static class Program
    {
        static Mutex mutex;

        [STAThread]
        static void Main()
        {
            bool created;
            mutex = new Mutex(true, "NetLensLauncher", out created);
            if (!created)
            {
                string u = ReadUrl();
                if (!string.IsNullOrEmpty(u))
                {
                    try { Process.Start(u); } catch { }
                }
                else
                {
                    MessageBox.Show("NetLens 已经在运行了，请看右下角托盘图标。",
                        "NetLens", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
                return;
            }
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new TrayApp());
        }

        internal static string UrlFile
        {
            get { return Path.Combine(Path.GetTempPath(), "netlens-url.txt"); }
        }

        static string ReadUrl()
        {
            try
            {
                if (File.Exists(UrlFile)) return File.ReadAllText(UrlFile).Trim();
            }
            catch { }
            return null;
        }
    }

    class TrayApp : ApplicationContext
    {
        NotifyIcon icon;
        Process server;
        string url;
        bool exiting;

        public TrayApp()
        {
            icon = new NotifyIcon();
            try
            {
                icon.Icon = Icon.ExtractAssociatedIcon(Application.ExecutablePath);
            }
            catch { }
            icon.Text = "NetLens · 本地流量分析";

            ContextMenuStrip menu = new ContextMenuStrip();
            menu.Items.Add("打开界面", null, delegate { OpenBrowser(); });
            menu.Items.Add("打开抓包目录", null, delegate { OpenCaptures(); });
            menu.Items.Add(new ToolStripSeparator());
            menu.Items.Add("退出 NetLens", null, delegate { ExitApp(); });
            icon.ContextMenuStrip = menu;
            icon.Visible = true;
            icon.DoubleClick += delegate { OpenBrowser(); };

            bool ok = StartServer();
            if (!ok)
            {
                MessageBox.Show("启动失败：没有找到 NetLens.ps1，或本地服务没有起来。\n" +
                    "请确认 NetLens.exe 与 NetLens.ps1 在同一个文件夹。",
                    "NetLens", MessageBoxButtons.OK, MessageBoxIcon.Error);
                ExitApp();
                return;
            }
            OpenBrowser();
        }

        void OpenCaptures()
        {
            try
            {
                string dir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "captures");
                if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
                Process.Start("explorer.exe", "\"" + dir + "\"");
            }
            catch { }
        }

        void OpenBrowser()
        {
            if (string.IsNullOrEmpty(url)) return;
            // 用 explorer 转交给当前用户会话，避免浏览器被“以管理员身份”启动
            try
            {
                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = "explorer.exe";
                psi.Arguments = "\"" + url + "\"";
                psi.UseShellExecute = false;
                Process.Start(psi);
                return;
            }
            catch { }
            try { Process.Start(url); } catch { }
        }

        int FreePort()
        {
            TcpListener l = new TcpListener(IPAddress.Loopback, 0);
            l.Start();
            int p = ((IPEndPoint)l.LocalEndpoint).Port;
            l.Stop();
            return p;
        }

        bool Ping(int port)
        {
            try
            {
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create("http://127.0.0.1:" + port + "/api/latest");
                req.Timeout = 700;
                req.Proxy = null;
                using (HttpWebResponse resp = (HttpWebResponse)req.GetResponse())
                {
                    return resp.StatusCode == HttpStatusCode.OK;
                }
            }
            catch { return false; }
        }

        bool StartServer()
        {
            string dir = AppDomain.CurrentDomain.BaseDirectory;
            string ps1 = Path.Combine(dir, "NetLens.ps1");
            if (!File.Exists(ps1)) return false;

            int port = FreePort();
            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = "powershell.exe";
            psi.Arguments = "-NoProfile -ExecutionPolicy Bypass -File \"" + ps1 +
                "\" -ServeOnly -Port " + port + " -NoBrowser";
            psi.UseShellExecute = false;
            psi.CreateNoWindow = true;
            psi.WindowStyle = ProcessWindowStyle.Hidden;
            psi.WorkingDirectory = dir;

            try { server = Process.Start(psi); }
            catch { return false; }

            for (int i = 0; i < 80; i++)
            {
                Thread.Sleep(250);
                if (server.HasExited) break;
                if (Ping(port))
                {
                    url = "http://127.0.0.1:" + port + "/";
                    try { File.WriteAllText(Program.UrlFile, url); } catch { }
                    return true;
                }
            }
            return false;
        }

        void ExitApp()
        {
            if (exiting) return;
            exiting = true;
            try { icon.Visible = false; icon.Dispose(); } catch { }
            try
            {
                if (server != null && !server.HasExited)
                {
                    ProcessStartInfo kill = new ProcessStartInfo();
                    kill.FileName = "taskkill";
                    kill.Arguments = "/PID " + server.Id + " /T /F";
                    kill.UseShellExecute = false;
                    kill.CreateNoWindow = true;
                    kill.WindowStyle = ProcessWindowStyle.Hidden;
                    Process.Start(kill);
                    server.WaitForExit(3000);
                }
            }
            catch { }
            try { if (File.Exists(Program.UrlFile)) File.Delete(Program.UrlFile); } catch { }
            ExitThread();
        }
    }
}
