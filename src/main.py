# Phasmophobia 鬼魂特征查看器 - 主程序
import os
import sys

APP_NAME = "恐鬼症鬼魂特征查看器"
APP_VERSION = "v2.4"

# 难度模式
DIFFICULTIES = ['普通', '噩梦', '疯人院', '零证据']

# 噩梦/疯人院难度下必定出现在笔记本上的"强制证据"
# 中文鬼名 -> 中文证据名
FORCED_EVIDENCE = {
    '御灵': '点阵投影仪',   # Goryo
    '幻妖': '紫外线',       # Obake
    '寒魔': '刺骨寒温',     # Hantu
    '魔洛伊': '通灵盒',     # Moroi
    '雾影': '通灵盒',       # Deogen
    '拟魂': '灵球',         # Mimic
}

# 明/暗两套主题配色
THEMES = {
    'light': {
        'window': '#f0f0f0', 'field': '#ffffff',
        'text': '#000000', 'muted': '#666666', 'btn_bg': '#e0e0e0',
        'ev_bg': '#f0f0f0', 'ev_include': '#90EE90', 'ev_include_fg': '#000000',
        'ev_exclude': '#FFB6C1', 'ev_exclude_fg': '#000000',
        'ev_disabled': '#d9d9d9', 'ev_disabled_fg': '#999999',
        'ghost_bg': '#f0f0f0', 'ghost_hover': '#d0d0d0', 'ghost_active': '#e0e0e0',
        'ghost_disabled_bg': '#a0a0a0', 'ghost_disabled_fg': '#666666',
        'canvas_bg': '#f0f0f0', 'text_bg': '#ffffff',
        'select_bg': '#90EE90', 'select_fg': '#000000',
        'exclude_bg': '#FFB6C1', 'exclude_fg': '#000000',
        'cand_name': '#1e3a8a', 'highlight': 'blue',
        'danger_low': 'green', 'danger_med': 'orange',
        'danger_high': 'red', 'danger_extreme': '#8B0000',
        'paned_bg': '#c0c0c0',
        'diff_field_bg': '#dbeafe', 'diff_field_fg': '#1e3a8a',
        'diff_btn_bg': '#1e40af', 'diff_btn_fg': 'white',
        'diff_active': '#2563eb',
    },
    'dark': {
        'window': '#1e1e1e', 'field': '#2d2d2d',
        'text': '#e0e0e0', 'muted': '#9a9a9a', 'btn_bg': '#3a3a3a',
        'ev_bg': '#2f2f2f', 'ev_include': '#2e7d4f', 'ev_include_fg': '#eafff2',
        'ev_exclude': '#8a3b52', 'ev_exclude_fg': '#ffe9f0',
        'ev_disabled': '#262626', 'ev_disabled_fg': '#777777',
        'ghost_bg': '#2f2f2f', 'ghost_hover': '#3d3d3d', 'ghost_active': '#3a3a3a',
        'ghost_disabled_bg': '#232323', 'ghost_disabled_fg': '#666666',
        'canvas_bg': '#1e1e1e', 'text_bg': '#2d2d2d',
        'select_bg': '#2e7d4f', 'select_fg': '#eafff2',
        'exclude_bg': '#8a3b52', 'exclude_fg': '#ffe9f0',
        'cand_name': '#7fb3e0', 'highlight': '#82b1ff',
        'danger_low': '#66bb6a', 'danger_med': '#ffa726',
        'danger_high': '#ef5350', 'danger_extreme': '#ff5252',
        'paned_bg': '#3a3a3a',
        'diff_field_bg': '#1e3a5f', 'diff_field_fg': '#dbeafe',
        'diff_btn_bg': '#1e40af', 'diff_btn_fg': 'white',
        'diff_active': '#2563eb',
    },
}

# PyInstaller frozen path support
if getattr(sys, 'frozen', False):
    base_dir = sys._MEIPASS
else:
    base_dir = os.path.dirname(os.path.abspath(__file__))

# 设置 Tcl/Tk 环境变量（PyInstaller 打包时需要）
tcl_dir = os.path.join(base_dir, 'tcl', 'tcl8.6')
tk_dir = os.path.join(base_dir, 'tcl', 'tk8.6')
if os.path.exists(tcl_dir):
    os.environ['TCL_LIBRARY'] = tcl_dir
if os.path.exists(tk_dir):
    os.environ['TK_LIBRARY'] = tk_dir

import tkinter as tk
from tkinter import ttk, messagebox
import json

class GhostViewer:
    def __init__(self, root):
        self.root = root
        self.root.title("恐鬼症鬼魂特征查看器")
        self.root.geometry("1200x700")
        self.root.attributes('-topmost', True)  # 始终在最上层
        self.root.attributes('-alpha', 0.95)  # 半透明
        
        # 设置图标（如果存在）
        icon_path = os.path.join(os.path.dirname(__file__), '..', 'assets', 'icon.ico')
        if os.path.exists(icon_path):
            self.root.iconbitmap(icon_path)
        
        # 加载鬼魂数据
        self.ghosts = self.load_ghost_data()
        
        # 加载配置与字号倍率
        self.config = self.load_config()
        # 黑夜模式（从配置读取，默认关闭）
        self.dark = bool(self.config.get('dark', False))
        self.save_font_scale = bool(self.config.get('font', {}).get('save_scale', True))
        if self.save_font_scale:
            self.font_scale = float(self.config.get('font', {}).get('scale', 1.0))
            self.detail_font_scale = float(self.config.get('font', {}).get('detail_scale', 1.0))
        else:
            # 未开启保存时，每次启动都使用默认 100%
            self.font_scale = 1.0
            self.detail_font_scale = 1.0
        
        # 当前选中的鬼魂
        self.current_ghost = None
        self.float_mode = False
        
        # 难度模式（默认普通）
        self.difficulty = DIFFICULTIES[0]
        
        # 鬼魂选择状态：0=未选, 1=选中(绿色), 2=排除(粉色)
        self.ghost_states = {}
        # 存储鬼魂按钮引用
        self.ghost_btn_refs = {}
        
        # 创建界面
        self.create_widgets()
        
        # 绑定快捷键
        self.root.bind('<Escape>', lambda e: self.minimize_to_float())
        self.root.bind('<Control-f>', self.focus_search)
        
        # 初始化显示
        self.update_ghost_list()
        # 窗口拖动改为仅绑定在顶部标题栏（见 create_widgets），
        # 避免在证据/鬼魂按钮上拖拽时误移动窗口
    
    def minimize_to_float(self):
        """缩小到50x50悬浮窗"""
        # 已在悬浮模式下：忽略重复的 Esc，避免覆盖原始窗口几何信息
        if self.float_mode:
            return
        
        # 保存当前窗口位置和大小
        self.original_geometry = self.root.geometry()
        
        # 先移除窗口边框再改大小，避免边框切换时尺寸被重置
        self.root.overrideredirect(True)
        
        # 隐藏所有组件
        for widget in self.root.winfo_children():
            widget.pack_forget()
        
        # 设置新大小和位置（50x50，在左上角）
        new_x = 10
        new_y = 10
        self.root.geometry(f"50x50+{new_x}+{new_y}")
        
        # 创建一个小的可点击区域
        float_frame = tk.Frame(self.root, bg='#2c3e50', cursor='hand2')
        float_frame.pack(fill=tk.BOTH, expand=True)
        
        # 添加标签
        float_label = tk.Label(float_frame, text="👻", font=('Arial', self.fs(20)),
                              bg='#2c3e50', fg='white')
        float_label.pack(expand=True)
        
        # 绑定点击事件恢复窗口
        float_frame.bind('<Button-1>', lambda e: self.restore_from_float())
        float_label.bind('<Button-1>', lambda e: self.restore_from_float())
        
        # 添加右键菜单
        float_frame.bind('<Button-3>', self.show_float_menu)
        float_label.bind('<Button-3>', self.show_float_menu)
        
        # 使窗口可拖动
        float_frame.bind('<B1-Motion>', self.drag_float_window)
        float_label.bind('<B1-Motion>', self.drag_float_window)
        
        # 立即应用小窗口尺寸（overrideredirect 切换是异步的，等一帧再设置更稳妥）
        self.root.update_idletasks()
        self.root.geometry(f"50x50+{new_x}+{new_y}")
        
        self.float_mode = True
    
    def restore_from_float(self):
        """从悬浮窗恢复"""
        if not self.float_mode:
            return
        if not hasattr(self, 'original_geometry') or not self.original_geometry:
            # 没有保存过原始几何信息时，至少保证窗口可用
            self.root.geometry("1200x700")
            self.original_geometry = self.root.geometry()
        
        # 恢复窗口边框
        self.root.overrideredirect(False)
        
        # 先让边框切换生效，再应用原始尺寸；
        # 注意：geometry() 的尺寸要到空闲处理时才真正生效，
        # 若先销毁组件再等空闲，未生效的尺寸会被新内容的要求尺寸顶掉
        self.root.update_idletasks()
        self.root.geometry(self.original_geometry)
        self.root.update_idletasks()
        
        # 删除悬浮窗组件
        for widget in self.root.winfo_children():
            widget.destroy()
        
        # 重新创建界面
        self.create_widgets()
        self.update_ghost_list()
        
        # 边框切换是异步的，稍后再应用一次原始尺寸，确保最终大小正确
        orig = self.original_geometry
        self.root.after(50, lambda: self.root.geometry(orig))
        
        self.float_mode = False
    
    def show_float_menu(self, event):
        """显示悬浮窗右键菜单"""
        menu = tk.Menu(self.root, tearoff=0)
        menu.add_command(label="恢复窗口", command=self.restore_from_float)
        menu.add_separator()
        menu.add_command(label="退出", command=self.root.destroy)
        menu.post(event.x_root, event.y_root)
    
    def drag_float_window(self, event):
        """拖动悬浮窗"""
        x = self.root.winfo_x() + event.x
        y = self.root.winfo_y() + event.y
        self.root.geometry(f"+{x}+{y}")
    def load_ghost_data(self):
        """加载鬼魂数据"""
        # 获取脚本所在目录
        script_dir = os.path.dirname(os.path.abspath(__file__))

        # PyInstaller 打包后的临时解压目录
        if getattr(sys, 'frozen', False):
            base_dir = sys._MEIPASS
        else:
            base_dir = script_dir

        # 尝试多个可能的路径
        possible_paths = []
        if getattr(sys, 'frozen', False):
            # 打包后优先读取 exe 同级的 data 目录，保证配置可持久保存
            possible_paths.append(os.path.join(
                os.path.dirname(sys.executable), 'data', 'ghosts_data_cn.json'))
        possible_paths += [
            os.path.join(base_dir, 'data', 'ghosts_data_cn.json'),
            os.path.join(script_dir, '..', 'data', 'ghosts_data_cn.json'),
            os.path.join(script_dir, 'ghosts_data_cn.json'),
            os.path.join(os.getcwd(), 'data', 'ghosts_data_cn.json'),
            os.path.join(os.getcwd(), 'ghosts_data_cn.json')
        ]
        
        for data_path in possible_paths:
            abs_path = os.path.abspath(data_path)
            if os.path.exists(abs_path):
                try:
                    with open(abs_path, 'r', encoding='utf-8-sig') as f:
                        data = json.load(f)
                        if sys.stdout is not None:
                            print(f"成功加载数据文件: {abs_path}")
                            print(f"鬼魂数量: {len(data)}")
                        return data
                except json.JSONDecodeError as e:
                    if sys.stdout is not None:
                        print(f"错误: JSON解析失败 - {abs_path}: {e}")
                    continue
        
        # 如果找不到文件，显示错误
        error_msg = f"找不到鬼魂数据文件！\n\n已尝试以下路径:\n"
        for path in possible_paths:
            error_msg += f"- {os.path.abspath(path)}\n"
        
        messagebox.showerror("错误", error_msg)
        return []

    def load_config(self):
        """加载配置文件：优先读取 %APPDATA%\\恐鬼症查看器\\config.json"""
        default_config = {"font": {"scale": 1.0, "detail_scale": 1.0, "save_scale": True}}
        config_dir = os.path.join(os.environ.get('APPDATA', os.path.expanduser('~')),
                                  '恐鬼症查看器')
        try:
            os.makedirs(config_dir, exist_ok=True)
            self.config_path = os.path.join(config_dir, 'config.json')
        except OSError:
            self.config_path = None

        if self.config_path and os.path.exists(self.config_path):
            try:
                with open(self.config_path, 'r', encoding='utf-8-sig') as f:
                    data = json.load(f)
                if not isinstance(data.get('font'), dict):
                    data['font'] = {}
                return data
            except (json.JSONDecodeError, OSError):
                pass
        return default_config

    def save_config(self):
        """把当前配置写回 %APPDATA%\\恐鬼症查看器\\config.json"""
        if not self.config_path:
            return
        try:
            os.makedirs(os.path.dirname(self.config_path), exist_ok=True)
            with open(self.config_path, 'w', encoding='utf-8') as f:
                json.dump(self.config, f, ensure_ascii=False, indent=2)
        except OSError:
            pass

    def tc(self, key):
        """当前主题下的颜色"""
        return THEMES['dark' if self.dark else 'light'].get(key, '#000000')

    def toggle_dark(self):
        """切换黑夜模式并保存配置"""
        self.dark = bool(self.dark_var.get())
        self.config['dark'] = self.dark
        self.save_config()
        self.rebuild_ui()

    def _apply_ttk_theme(self, style):
        """按当前主题配置 ttk 样式（需先切换到 clam 主题才能自定义颜色）"""
        bg = self.tc('window')
        text = self.tc('text')
        field = self.tc('field')
        btn_bg = self.tc('btn_bg')
        active = self.tc('ghost_active')
        muted = self.tc('muted')
        style.configure('TFrame', background=bg)
        style.configure('TLabelframe', background=bg, bordercolor=btn_bg)
        style.configure('TLabelframe.Label', background=bg, foreground=text,
                        font=('微软雅黑', self.fs(9), 'bold'))
        style.configure('TLabel', background=bg, foreground=text)
        style.configure('Title.TLabel', background=bg, foreground=text,
                        font=('微软雅黑', self.fs(12), 'bold'))
        style.configure('Header.TLabel', background=bg, foreground=text,
                        font=('微软雅黑', self.fs(10), 'bold'))
        style.configure('Detail.TLabel', background=bg, foreground=text,
                        font=('微软雅黑', self.fs(9)))
        style.configure('TButton', background=btn_bg, foreground=text,
                        bordercolor=btn_bg, focusthickness=0)
        style.map('TButton',
                  background=[('active', active), ('pressed', active)],
                  foreground=[('disabled', muted)])
        style.configure('App.TButton', background=btn_bg, foreground=text)
        style.map('App.TButton',
                  background=[('active', active), ('pressed', active)])
        style.configure('TCheckbutton', background=bg, foreground=text)
        style.map('TCheckbutton', background=[('active', bg)])
        style.configure('App.TCheckbutton', background=bg, foreground=text)
        style.map('App.TCheckbutton', background=[('active', bg)])
        style.configure('TEntry', fieldbackground=field, foreground=text,
                        insertcolor=text, bordercolor=btn_bg)
        style.configure('Vertical.TScrollbar', background=btn_bg, troughcolor=bg,
                        bordercolor=bg, arrowcolor=text)
        style.configure('Horizontal.TScrollbar', background=btn_bg, troughcolor=bg,
                        bordercolor=bg, arrowcolor=text)

    def fs(self, size):
        """按全局字号倍率计算实际字号"""
        return max(6, int(round(size * self.font_scale)))

    def dfs(self, size):
        """按详情面板字号倍率计算实际字号"""
        return max(6, int(round(size * self.detail_font_scale)))

    def change_font_scale(self, delta):
        """调整全局字号倍率、保存配置并重建界面"""
        self.font_scale = round(min(2.5, max(0.5, self.font_scale + delta)), 2)
        if self.save_font_scale:
            self.config.setdefault('font', {})['scale'] = self.font_scale
            self.save_config()
        if hasattr(self, 'font_scale_var'):
            self.font_scale_var.set(str(int(self.font_scale * 100)))
        self.rebuild_ui()

    def change_detail_font_scale(self, delta):
        """调整详情面板字号倍率、保存配置并重建界面"""
        self.detail_font_scale = round(min(2.5, max(0.5, self.detail_font_scale + delta)), 2)
        if self.save_font_scale:
            self.config.setdefault('font', {})['detail_scale'] = self.detail_font_scale
            self.save_config()
        if hasattr(self, 'detail_font_scale_var'):
            self.detail_font_scale_var.set(str(int(self.detail_font_scale * 100)))
        self.rebuild_ui()

    def on_save_scale_toggle(self):
        """「保存字号设置」勾选状态变化：立即持久化这个偏好本身"""
        self.save_font_scale = bool(self.save_font_scale_var.get())
        self.config.setdefault('font', {})['save_scale'] = self.save_font_scale
        self.save_config()

    def _read_scale_var(self, var, current):
        """解析百分比输入框：非法值回退到当前值，并夹取到 50–250"""
        try:
            val = int(float(str(var.get()).strip()))
        except (ValueError, AttributeError):
            val = int(current * 100)
        val = max(50, min(250, val))
        var.set(str(val))
        return round(val / 100.0, 2)

    def _apply_font_scale_from_var(self):
        """读取全局字号输入框并应用"""
        self.font_scale = self._read_scale_var(self.font_scale_var, self.font_scale)
        if self.save_font_scale:
            self.config.setdefault('font', {})['scale'] = self.font_scale
            self.save_config()
        self.rebuild_ui()

    def _apply_detail_font_scale_from_var(self):
        """读取详情字号输入框并应用"""
        self.detail_font_scale = self._read_scale_var(self.detail_font_scale_var,
                                                      self.detail_font_scale)
        if self.save_font_scale:
            self.config.setdefault('font', {})['detail_scale'] = self.detail_font_scale
            self.save_config()
        self.rebuild_ui()

    def rebuild_ui(self):
        """销毁并重建整个界面（保留证据筛选、搜索与当前查看状态）"""
        # 保存当前界面状态
        ev_states = {}
        if hasattr(self, 'evidence_vars'):
            ev_states = {ev_id: var.get() for ev_id, var in self.evidence_vars.items()}
        search_text = ''
        if hasattr(self, 'search_var'):
            search_text = self.search_var.get()
        current_ghost = self.current_ghost
        
        for widget in self.root.winfo_children():
            widget.destroy()
        self.create_widgets()
        
        # 恢复状态
        for ev_id, state in ev_states.items():
            if ev_id in self.evidence_vars:
                self.evidence_vars[ev_id].set(state)
                self.update_evidence_display(ev_id)
        self.search_var.set(search_text)
        self.update_ghost_list()
        if current_ghost is not None:
            self.show_ghost_detail(current_ghost)

    def focus_search(self, event=None):
        """Ctrl+F：聚焦搜索框"""
        self.search_entry.focus_set()

    def create_widgets(self):
        """创建界面组件 - 横向四栏布局"""
        # 应用主题背景（ttk 用 clam 主题以支持自定义颜色）
        self.root.configure(bg=self.tc('window'))
        style = ttk.Style()
        style.theme_use('clam')
        self._apply_ttk_theme(style)
        style.configure('Title.TLabel', font=('微软雅黑', self.fs(12), 'bold'))
        style.configure('Header.TLabel', font=('微软雅黑', self.fs(10), 'bold'))
        style.configure('Detail.TLabel', font=('微软雅黑', self.fs(9)))
        style.configure('App.TButton', font=('微软雅黑', self.fs(10)))
        style.configure('App.TCheckbutton', font=('微软雅黑', self.fs(9)))
        
        # 主框架
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # 标题栏（可拖动区域）
        title_frame = ttk.Frame(main_frame)
        title_frame.pack(fill=tk.X, pady=(0, 10))
        
        title_label = ttk.Label(title_frame, text=f"👻 {APP_NAME} {APP_VERSION}", style='Title.TLabel')
        title_label.pack(side=tk.LEFT)
        
        # 仅拖动顶部标题栏可移动窗口
        title_frame.bind('<Button-1>', self.start_move)
        title_frame.bind('<B1-Motion>', self.on_move)
        title_label.bind('<Button-1>', self.start_move)
        title_label.bind('<B1-Motion>', self.on_move)
        
        # 背景色说明
        legend_frame = ttk.Frame(main_frame)
        legend_frame.pack(fill=tk.X, pady=(0, 5))
        
        legend_items = [
            ('  ', self.tc('ev_bg'), '未选中'),
            ('  ', self.tc('select_bg'), '选中'),
            ('  ', self.tc('exclude_bg'), '排除'),
            ('  ', self.tc('ghost_disabled_bg'), '不匹配'),
        ]
        
        for color, bg, label in legend_items:
            swatch = tk.Label(legend_frame, text='  ', bg=bg, relief=tk.SUNKEN, width=2)
            swatch.pack(side=tk.LEFT, padx=(5, 2))
            txt = ttk.Label(legend_frame, text=label, font=('微软雅黑', self.fs(8)))
            txt.pack(side=tk.LEFT, padx=(0, 10))
        
        # 右上角：黑夜模式开关（最右侧）
        self.dark_var = tk.BooleanVar(value=self.dark)
        ttk.Checkbutton(legend_frame, text="🌙 黑夜模式",
                        variable=self.dark_var, style='App.TCheckbutton',
                        command=self.toggle_dark).pack(side=tk.RIGHT, padx=(8, 2))
        
        # 右上角：难度模式选择（真正下拉框形态：字段 + ▾ 按钮 + 弹出菜单）
        diff_frame = ttk.Frame(legend_frame)
        diff_frame.pack(side=tk.RIGHT, padx=(0, 6))

        self.difficulty_var = tk.StringVar(value=self.difficulty)
        self.difficulty_entry = tk.Entry(
            diff_frame, textvariable=self.difficulty_var, state='readonly',
            font=('微软雅黑', self.fs(11), 'bold'),
            bg=self.tc('diff_field_bg'), fg=self.tc('diff_field_fg'),
            readonlybackground=self.tc('diff_field_bg'),
            relief=tk.SUNKEN, bd=2, width=9, justify=tk.CENTER)
        self.difficulty_entry.pack(side=tk.LEFT, ipady=2)
        self.difficulty_entry.bind('<Button-1>', lambda e: self._pop_difficulty_menu())

        self.difficulty_btn = tk.Button(
            diff_frame, text='▾', command=self._pop_difficulty_menu,
            font=('微软雅黑', self.fs(11), 'bold'),
            bg=self.tc('diff_btn_bg'), fg=self.tc('diff_btn_fg'),
            activebackground=self.tc('diff_active'), activeforeground='white',
            relief=tk.RAISED, bd=2, cursor='hand2', padx=8)
        self.difficulty_btn.pack(side=tk.LEFT, fill=tk.Y)
        
        # 右上角：字号调节（A- / 输入框 / A+），与图例平行
        font_ctrl_frame = ttk.Frame(legend_frame)
        font_ctrl_frame.pack(side=tk.RIGHT)

        # 是否保存字号设置
        self.save_font_scale_var = tk.BooleanVar(value=self.save_font_scale)
        ttk.Checkbutton(font_ctrl_frame, text="保存字号设置",
                        variable=self.save_font_scale_var,
                        style='App.TCheckbutton',
                        command=self.on_save_scale_toggle).pack(side=tk.LEFT, padx=(0, 6))

        ttk.Label(font_ctrl_frame, text="全局", font=('微软雅黑', self.fs(8))).pack(side=tk.LEFT)
        ttk.Button(font_ctrl_frame, text="A-", width=2,
                   style='App.TButton',
                   command=lambda: self.change_font_scale(-0.15)).pack(side=tk.LEFT, padx=(2, 0))
        ttk.Button(font_ctrl_frame, text="A+", width=2,
                   style='App.TButton',
                   command=lambda: self.change_font_scale(0.15)).pack(side=tk.LEFT, padx=(2, 0))
        self.font_scale_var = tk.StringVar(value=str(int(self.font_scale * 100)))
        font_entry = ttk.Entry(font_ctrl_frame, textvariable=self.font_scale_var,
                               width=5, justify=tk.RIGHT)
        font_entry.pack(side=tk.LEFT, padx=(2, 0))
        font_entry.bind('<Return>', lambda e: self._apply_font_scale_from_var())
        font_entry.bind('<FocusOut>', lambda e: self._apply_font_scale_from_var())
        ttk.Label(font_ctrl_frame, text="%", font=('微软雅黑', self.fs(8))).pack(side=tk.LEFT)

        ttk.Label(font_ctrl_frame, text="详情", font=('微软雅黑', self.fs(8))).pack(side=tk.LEFT, padx=(8, 0))
        ttk.Button(font_ctrl_frame, text="A-", width=2,
                   style='App.TButton',
                   command=lambda: self.change_detail_font_scale(-0.15)).pack(side=tk.LEFT, padx=(2, 0))
        ttk.Button(font_ctrl_frame, text="A+", width=2,
                   style='App.TButton',
                   command=lambda: self.change_detail_font_scale(0.15)).pack(side=tk.LEFT, padx=(2, 0))
        self.detail_font_scale_var = tk.StringVar(value=str(int(self.detail_font_scale * 100)))
        detail_entry = ttk.Entry(font_ctrl_frame, textvariable=self.detail_font_scale_var,
                                 width=5, justify=tk.RIGHT)
        detail_entry.pack(side=tk.LEFT, padx=(2, 0))
        detail_entry.bind('<Return>', lambda e: self._apply_detail_font_scale_from_var())
        detail_entry.bind('<FocusOut>', lambda e: self._apply_detail_font_scale_from_var())
        ttk.Label(font_ctrl_frame, text="%", font=('微软雅黑', self.fs(8))).pack(side=tk.LEFT)
        
        # 搜索框
        search_frame = ttk.LabelFrame(main_frame, text="🔍 搜索鬼魂", padding="5")
        search_frame.pack(fill=tk.X, pady=(0, 10))
        
        # 开始新对局按钮
        new_contract_btn = ttk.Button(search_frame, text="🆕 开始新对局",
                                      style='App.TButton',
                                      command=self.start_new_contract)
        new_contract_btn.pack(side=tk.RIGHT, padx=(6, 0))
        
        self.search_var = tk.StringVar()
        self.search_var.trace('w', self.on_search_change)
        self.search_entry = ttk.Entry(search_frame, textvariable=self.search_var)
        self.search_entry.pack(fill=tk.X)
        self.search_entry.bind('<Return>', lambda e: self.search_entry.selection_clear())
        
        # ===== 横向四栏容器（可拖动分隔条，每栏可单独拉宽） =====
        self.paned = tk.PanedWindow(main_frame, orient=tk.HORIZONTAL,
                                    sashwidth=6, sashrelief=tk.RAISED,
                                    bg=self.tc('paned_bg'), bd=0, relief=tk.FLAT)
        self.paned.pack(fill=tk.BOTH, expand=True)
        
        # 第一栏：证据筛选（左侧，纵向排列）
        evidence_frame = ttk.LabelFrame(self.paned, text="📋 证据筛选", padding="5")
        self.paned.add(evidence_frame, minsize=120, width=140, stretch='never')
        
        # 证据复选框
        self.evidence_vars = {}
        self.evidence_cbs = {}
        evidence_types = [
            ('emf', 'EMF读数5级'),
            ('box', '通灵盒'),
            ('uv', '紫外线'),
            ('orb', '灵球'),
            ('writing', '鬼魂笔记'),
            ('freezing', '刺骨寒温'),
            ('dots', '点阵投影仪')
        ]
        
        for i, (ev_id, ev_name) in enumerate(evidence_types):
            var = tk.IntVar(value=0)
            self.evidence_vars[ev_id] = var
            cb = tk.Label(evidence_frame, text=ev_name, relief=tk.RAISED, 
                         padx=8, pady=4, cursor='hand2', bg=self.tc('ev_bg'),
                         fg=self.tc('text'),
                         font=('Microsoft YaHei', self.fs(10)))
            cb.bind('<Button-1>', lambda e, eid=ev_id: self.cycle_evidence(eid))
            cb.pack(fill=tk.X, pady=2)
            self.evidence_cbs[ev_id] = cb
        
        # 清除筛选按钮
        clear_btn = ttk.Button(evidence_frame, text="清除筛选", 
                              style='App.TButton', command=self.clear_filters)
        clear_btn.pack(fill=tk.X, pady=(10, 0))
        
        # 第二栏：鬼魂列表（中间，纵向滚动列表）
        list_frame = ttk.LabelFrame(self.paned, text="👻 鬼魂列表", padding="5")
        self.paned.add(list_frame, minsize=200, width=380, stretch='always')
        
        self.ghost_grid_frame = tk.Frame(list_frame, bg=self.tc('window'))
        self.ghost_grid_frame.pack(fill=tk.BOTH, expand=True)
        
        # 滚动条
        self.ghost_canvas = tk.Canvas(self.ghost_grid_frame, bg=self.tc('canvas_bg'),
                                      highlightthickness=0)
        self.ghost_scrollbar = ttk.Scrollbar(self.ghost_grid_frame, orient=tk.VERTICAL, command=self.ghost_canvas.yview)
        self.ghost_scrollable_frame = tk.Frame(self.ghost_canvas, bg=self.tc('canvas_bg'))
        
        self.ghost_scrollable_frame.bind(
            "<Configure>",
            lambda e: self.ghost_canvas.configure(scrollregion=self.ghost_canvas.bbox("all"))
        )
        
        self.ghost_canvas_window = self.ghost_canvas.create_window((0, 0), window=self.ghost_scrollable_frame, anchor="nw")
        self.ghost_canvas.configure(yscrollcommand=self.ghost_scrollbar.set)
        
        self.ghost_canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        self.ghost_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        # 画布宽度变化时同步内部网格宽度（拉宽列表栏时按钮自动填满）
        self.ghost_canvas.bind('<Configure>', self.on_canvas_resize)
        
        # 鬼魂按钮列表
        self.ghost_buttons = []
        self.ghost_names = []
        
        # 绑定鼠标滚轮
        self.ghost_canvas.bind("<MouseWheel>", lambda e: self.ghost_canvas.yview_scroll(-1*(e.delta//120), "units"))
        self.ghost_scrollable_frame.bind("<MouseWheel>", lambda e: self.ghost_canvas.yview_scroll(-1*(e.delta//120), "units"))
        
        # 候选鉴别建议栏（列表与详情之间，候选收窄到 2-4 只时自动插入）
        self.candidate_frame = ttk.LabelFrame(self.paned, text="💡 候选鉴别建议", padding="5")
        
        # 第三栏：鬼魂详情（右侧，纵向填充）
        self.detail_frame = ttk.LabelFrame(self.paned, text="📖 鬼魂详情", padding="5")
        self.paned.add(self.detail_frame, minsize=250, width=380, stretch='always')
        
        # 详情文本框和滚动条
        detail_container = ttk.Frame(self.detail_frame)
        detail_container.pack(fill=tk.BOTH, expand=True)
        
        detail_scrollbar = ttk.Scrollbar(detail_container)
        detail_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.detail_text = tk.Text(detail_container, wrap=tk.WORD, 
                                  font=('微软雅黑', self.dfs(9)),
                                  bg=self.tc('text_bg'), fg=self.tc('text'),
                                  insertbackground=self.tc('text'),
                                  yscrollcommand=detail_scrollbar.set)
        self.detail_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        detail_scrollbar.config(command=self.detail_text.yview)
        
        self.detail_text.config(state=tk.DISABLED)
        
        # 配置文本标签
        self.detail_text.tag_configure('title', font=('微软雅黑', self.dfs(11), 'bold'))
        self.detail_text.tag_configure('header', font=('微软雅黑', self.dfs(9), 'bold'))
        self.detail_text.tag_configure('normal', font=('微软雅黑', self.dfs(9)))
        self.detail_text.tag_configure('highlight', foreground=self.tc('highlight'))
        
        # 状态栏
        status_frame = ttk.Frame(main_frame)
        status_frame.pack(fill=tk.X, pady=(5, 0))
        
        self.status_label = ttk.Label(status_frame, text="就绪", font=('微软雅黑', self.fs(8)))
        self.status_label.pack(side=tk.LEFT)
        
        # 快捷键提示
        shortcut_label = ttk.Label(status_frame, text="Ctrl+F: 搜索 | Esc: 退出", 
                                  font=('微软雅黑', self.fs(8)))
        shortcut_label.pack(side=tk.RIGHT)
        
        # 系统标题栏跟随明/暗主题
        self._apply_windows_titlebar_theme()
    
    def _apply_windows_titlebar_theme(self):
        """Windows 10/11：让系统窗口标题栏跟随明/暗主题"""
        if sys.platform != 'win32':
            return
        try:
            from ctypes import windll, c_int, byref, sizeof
            hwnd = windll.user32.GetParent(self.root.winfo_id())
            if not hwnd:
                return
            value = c_int(1 if self.dark else 0)
            # DWMWA_USE_IMMERSIVE_DARK_MODE：Win10 2004+ 用 20，旧版用 19
            ret = windll.dwmapi.DwmSetWindowAttribute(hwnd, 20, byref(value), sizeof(value))
            if ret != 0:
                windll.dwmapi.DwmSetWindowAttribute(hwnd, 19, byref(value), sizeof(value))
        except Exception:
            pass
    
    def start_move(self, event):
        """开始移动窗口"""
        self.x = event.x
        self.y = event.y
    
    def on_move(self, event):
        """移动窗口"""
        deltax = event.x - self.x
        deltay = event.y - self.y
        x = self.root.winfo_x() + deltax
        y = self.root.winfo_y() + deltay
        self.root.geometry(f"+{x}+{y}")
    
    def on_search_change(self, *args):
        """搜索框内容变化时的回调"""
        self.update_ghost_list()
    
    def on_filter_change(self):
        """证据筛选变化时的回调"""
        self.update_ghost_list()
    
    def clear_filters(self):
        """清除所有筛选条件"""
        self.search_var.set('')
        for ev_id, var in self.evidence_vars.items():
            var.set(0)
            self.update_evidence_display(ev_id)
        self.ghost_states.clear()
        self.update_ghost_list()
    
    def cycle_evidence(self, ev_id):
        """切换证据状态：0=未选, 1=包含(+), 2=排除(-)"""
        if self.difficulty == '零证据':
            self.status_label.config(text="零证据模式下无证据可收集，请通过行为特征判断")
            return
        var = self.evidence_vars[ev_id]
        current = var.get()
        if current == 0:
            slots = self.evidence_slots()
            included = sum(1 for v in self.evidence_vars.values() if v.get() == 1)
            if included >= slots:
                self.status_label.config(
                    text=f"当前难度（{self.difficulty}）最多确认 {slots} 条证据，请先排除其他证据")
                return
        var.set((current + 1) % 3)
        self.update_evidence_display(ev_id)
        self.update_ghost_list()
    
    def evidence_slots(self):
        """当前难度下最多可确认（包含）的证据数"""
        if self.difficulty == '噩梦':
            return 2
        if self.difficulty == '疯人院':
            return 1
        if self.difficulty == '零证据':
            return 0
        return 7  # 普通
    
    def _pop_difficulty_menu(self):
        """弹出难度下拉菜单"""
        menu = tk.Menu(self.difficulty_btn, tearoff=0,
                       font=('微软雅黑', self.fs(10)),
                       bg=self.tc('diff_field_bg'), fg=self.tc('diff_field_fg'),
                       activebackground=self.tc('diff_btn_bg'), activeforeground='white')
        for d in DIFFICULTIES:
            label = ('✓ ' + d) if d == self.difficulty else d
            menu.add_command(label=label, command=lambda d=d: self.set_difficulty(d))
        try:
            menu.tk_popup(self.difficulty_btn.winfo_rootx(),
                          self.difficulty_btn.winfo_rooty() + self.difficulty_btn.winfo_height())
        finally:
            menu.grab_release()
    
    def set_difficulty(self, difficulty):
        """切换难度模式"""
        self.difficulty = difficulty
        self.difficulty_var.set(difficulty)
        # 难度切换后证据语义不同，清空证据筛选
        for ev_id, var in self.evidence_vars.items():
            var.set(0)
            self.update_evidence_display(ev_id)
        self.status_label.config(text=f"难度已切换为：{self.difficulty}")
        self.update_ghost_list()
    
    def start_new_contract(self):
        """开始新对局：清空搜索、证据筛选与鬼魂选择状态"""
        self.search_var.set('')
        for ev_id, var in self.evidence_vars.items():
            var.set(0)
            self.update_evidence_display(ev_id)
        self.ghost_states.clear()
        self.current_ghost = None
        self.status_label.config(text=f"🆕 已开始新对局 | 难度：{self.difficulty}")
        self.update_ghost_list()
    
    def _test_short_name(self, ghost):
        """从识别技巧中提取测试名称（第一个「：」之前的部分）"""
        test = ghost.get('test', '') or ''
        if '：' in test:
            return test.split('：', 1)[0]
        if ':' in test:
            return test.split(':', 1)[0]
        return (test[:12] + '…') if len(test) > 12 else test
    
    def _cjk_wrap_line(self, line, font_name, max_w):
        """中文排版禁则断行：行首不出闭合标点（，。；等），行尾不留开括号（（「等）"""
        if not line:
            return line
        no_start = set('，。；：、！？）」』】》…')
        no_end = set('（「『《【')
        measure = lambda s: float(self.root.tk.call('font', 'measure', font_name, s))
        lines = []
        cur = ''
        cur_w = 0.0
        for ch in line:
            w = measure(ch)
            if cur and cur_w + w > max_w:
                if ch in no_start:
                    # 行首禁标点：把它留在当前行尾（允许轻微超出）
                    cur += ch
                    cur_w += w
                else:
                    if cur[-1] in no_end:
                        # 行尾不留开括号：把它带到下一行
                        lines.append(cur[:-1])
                        cur = cur[-1] + ch
                    else:
                        lines.append(cur)
                        cur = ch
                    cur_w = measure(cur)
            else:
                cur += ch
                cur_w += w
        if cur:
            lines.append(cur)
        return '\n'.join(lines)
    
    def _candidate_rewrap(self, event):
        """候选列宽度变化时按新宽度重新断行"""
        txt = getattr(self, '_candidate_txt', None)
        if txt is None or not getattr(self, '_candidate_segments', None):
            return
        if txt is not event.widget:
            return
        w = max(60, event.width - 8)
        if abs(w - getattr(self, '_candidate_last_w', 0)) < 12:
            return
        self._candidate_last_w = w
        try:
            y = txt.yview()[0]
        except Exception:
            y = 0.0
        txt.config(state=tk.NORMAL)
        txt.delete(1.0, tk.END)
        font_name = txt.cget('font')
        for text, tag in self._candidate_segments:
            wrapped = '\n'.join(self._cjk_wrap_line(ln, font_name, w)
                                for ln in text.split('\n'))
            txt.insert(tk.END, wrapped, tag)
        txt.config(state=tk.DISABLED)
        try:
            txt.yview_moveto(y)
        except Exception:
            pass
    
    def update_candidate_advice(self, matched_names):
        """候选收窄到 2-4 只时，展示区分线索与各候选完整测试方式"""
        MAX_CANDIDATES = 4
        if not (2 <= len(matched_names) <= MAX_CANDIDATES):
            if hasattr(self, 'candidate_frame') and \
                    self.candidate_frame.winfo_manager() == 'panedwindow':
                self.paned.forget(self.candidate_frame)
            return
        # 清空旧内容
        for widget in self.candidate_frame.winfo_children():
            widget.destroy()
        
        cands = [g for g in self.ghosts if g['name'] in matched_names]
        
        # 可滚动文本区域（手动禁则断行，不依赖 Text 自带的 WORD/CHAR 换行）
        text_frame = ttk.Frame(self.candidate_frame)
        text_frame.pack(fill=tk.BOTH, expand=True)
        scrollbar = ttk.Scrollbar(text_frame, orient=tk.VERTICAL)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        txt = tk.Text(text_frame, wrap=tk.NONE,
                      font=('微软雅黑', self.fs(9)),
                      bg=self.tc('text_bg'), fg=self.tc('text'),
                      insertbackground=self.tc('text'),
                      yscrollcommand=scrollbar.set, width=30,
                      relief=tk.FLAT, borderwidth=0, padx=4, pady=2)
        txt.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.config(command=txt.yview)
        self._candidate_txt = txt
        self._candidate_last_w = 0
        
        txt.tag_configure('head', font=('微软雅黑', self.fs(9), 'bold'))
        txt.tag_configure('name', font=('微软雅黑', self.fs(9), 'bold'),
                          foreground=self.tc('cand_name'))
        txt.tag_configure('normal', font=('微软雅黑', self.fs(9)))
        
        # 收集内容段（文本, 标签），供宽度变化时重排
        self._candidate_segments = []
        def put(text, tag):
            self._candidate_segments.append((text, tag))
        
        put(f"候选 {len(cands)} 只\n", 'head')
        
        # 区分线索：只出现在部分候选身上的证据
        ev_counter = {}
        for g in cands:
            for ev in g['evidence']:
                ev_counter[ev] = ev_counter.get(ev, 0) + 1
        disc_ev = [ev for ev, c in ev_counter.items() if 0 < c < len(cands)]
        # 按界面证据顺序排列
        order = {name: i for i, (_, name) in enumerate([
            ('emf', 'EMF读数5级'), ('box', '通灵盒'), ('uv', '紫外线'),
            ('orb', '灵球'), ('writing', '鬼魂笔记'),
            ('freezing', '刺骨寒温'), ('dots', '点阵投影仪')])}
        disc_ev.sort(key=lambda ev: order.get(ev, 99))
        
        if disc_ev:
            put("\n🔑 区分线索（看到即可锁定/排除）\n", 'head')
            for ev in disc_ev:
                owners = [g['name'] for g in cands if ev in g['evidence']]
                put(f"  • {ev} → {'、'.join(owners)}\n", 'normal')
        
        # 各候选完整测试方式
        put("\n🧪 完整测试方式\n", 'head')
        for g in cands:
            short = self._test_short_name(g)
            put(f"◆ {g['name']}", 'name')
            if short:
                put(f"（{short}）", 'name')
            put("\n", 'normal')
            test = g.get('test', '') or ''
            if test:
                put(test + "\n\n", 'normal')
        
        # 按当前可用宽度断行插入
        font_name = txt.cget('font')
        w = self._candidate_text_width(txt)
        self._candidate_last_w = w
        for text, tag in self._candidate_segments:
            wrapped = '\n'.join(self._cjk_wrap_line(ln, font_name, w)
                                for ln in text.split('\n'))
            txt.insert(tk.END, wrapped, tag)
        
        txt.config(state=tk.DISABLED)
        # 栏宽变化（拖动分隔条/窗口缩放）时重排
        txt.bind('<Configure>', self._candidate_rewrap)
        
        if self.candidate_frame.winfo_manager() != 'panedwindow':
            self.paned.add(self.candidate_frame, minsize=200, width=290,
                           before=self.detail_frame)
    
    def _candidate_text_width(self, txt):
        """当前可用文本宽度（未布局时按默认栏宽估算）"""
        w = txt.winfo_width()
        if w <= 1:
            w = 290 - 30  # 默认栏宽 - 滚动条与边距
        return max(60, w - 8)  # 减去 padx(4*2)
    
    def update_evidence_display(self, ev_id):
        """更新证据按钮的显示状态 - 只改变背景色，不改变文字"""
        var = self.evidence_vars[ev_id]
        cb = self.evidence_cbs[ev_id]
        if self.difficulty == '零证据':
            # 零证据模式下证据按钮置灰不可用
            cb.configure(bg=self.tc('ev_disabled'), fg=self.tc('ev_disabled_fg'),
                         cursor='arrow')
            return
        state = var.get()
        if state == 1:
            cb.configure(bg=self.tc('ev_include'), fg=self.tc('ev_include_fg'))  # 包含
        elif state == 2:
            cb.configure(bg=self.tc('ev_exclude'), fg=self.tc('ev_exclude_fg'))  # 排除
        else:
            cb.configure(bg=self.tc('ev_bg'), fg=self.tc('text'))  # 未选
    
    def get_evidence_name(self, ev_id):
        """获取证据的中文名称"""
        names = {
            'emf': 'EMF读数5级',
            'box': '通灵盒',
            'uv': '紫外线',
            'orb': '灵球',
            'writing': '鬼魂笔记',
            'freezing': '刺骨寒温',
            'dots': '点阵投影仪'
        }
        return names.get(ev_id, ev_id)
    
    def update_ghost_list(self):
        """更新鬼魂列表显示 - 显示所有鬼魂，不匹配的变暗禁用"""
        
        # 获取筛选条件
        search_text = self.search_var.get().lower()
        
        # 证据ID到中文名称的映射
        evidence_names = {
            'emf': 'EMF读数5级',
            'box': '通灵盒',
            'uv': '紫外线',
            'orb': '灵球',
            'writing': '鬼魂笔记',
            'freezing': '刺骨寒温',
            'dots': '点阵投影仪'
        }
        
        # Get tri-state conditions
        include_evidence = []
        exclude_evidence = []
        for ev_id, var in self.evidence_vars.items():
            state = var.get()
            ev_name = evidence_names.get(ev_id, ev_id)
            if state == 1:
                include_evidence.append(ev_name)
            elif state == 2:
                exclude_evidence.append(ev_name)
        
        # 零证据模式：无证据筛选
        zero_ev = (self.difficulty == '零证据')
        
        # 判断每个鬼魂是否匹配
        ghost_match = {}
        matched_count = 0
        for ghost in self.ghosts:
            name = ghost['name']
            is_match = True
            
            # 搜索筛选
            if search_text and search_text not in name.lower():
                is_match = False
            
            if not zero_ev:
                # 证据包含筛选
                if is_match and include_evidence:
                    if not all(ev in ghost['evidence'] for ev in include_evidence):
                        is_match = False
                
                # 证据排除筛选
                if is_match and exclude_evidence:
                    if any(ev in ghost['evidence'] for ev in exclude_evidence):
                        is_match = False
                
                # 噩梦/疯人院：强制证据规则
                # 该难度下每只鬼的"强制证据"必定出现在笔记本上；
                # 当已确认（包含）的证据数达到该难度的证据槽位时，
                # 若某鬼的强制证据不在已确认证据中，则该鬼不可能是答案
                if is_match and self.difficulty in ('噩梦', '疯人院'):
                    forced = FORCED_EVIDENCE.get(name)
                    if forced and len(include_evidence) >= self.evidence_slots():
                        if forced not in include_evidence:
                            is_match = False
            
            ghost_match[name] = is_match
            if is_match:
                matched_count += 1
        
        # 清除鬼魂列表
        for widget in self.ghost_scrollable_frame.winfo_children():
            widget.destroy()
        self.ghost_buttons = []
        self.ghost_names = []
        
        # 添加鬼魂按钮（三列网格布局，显示所有鬼魂）
        cols = 3
        for i, ghost in enumerate(self.ghosts):
            row = i // cols
            col = i % cols
            name = ghost['name']
            is_match = ghost_match.get(name, False)
            
            if is_match:
                # 匹配的鬼魂：正常显示，可点击
                btn = tk.Button(self.ghost_scrollable_frame, text=name,
                              command=lambda g=ghost: self.on_ghost_click(g),
                              relief=tk.RAISED, padx=8, pady=4, cursor='hand2',
                              font=('Microsoft YaHei', self.fs(10)),
                              bg=self.tc('ghost_bg'), fg=self.tc('text'),
                              activebackground=self.tc('ghost_active'),
                              activeforeground=self.tc('text'))
                btn.bind('<Enter>',
                         lambda e, b=btn: b.configure(bg=self.tc('ghost_hover'))
                         if b.cget('state') == 'normal' else None)
                btn.bind('<Leave>', lambda e, b=btn, n=name: self._restore_ghost_btn_bg(b, n))
            else:
                # 不匹配的鬼魂：变暗，禁用
                btn = tk.Button(self.ghost_scrollable_frame, text=name,
                              state=tk.DISABLED,
                              relief=tk.FLAT, padx=8, pady=4,
                              font=('Microsoft YaHei', self.fs(10)),
                              bg=self.tc('ghost_disabled_bg'),
                              fg=self.tc('ghost_disabled_fg'),
                              disabledforeground=self.tc('ghost_disabled_fg'))
            
            btn.grid(row=row, column=col, padx=3, pady=2, sticky='ew')
            self.ghost_buttons.append(btn)
            self.ghost_names.append(name)
            self.ghost_btn_refs[name] = btn
            
            # 应用已保存的选择状态
            saved_state = self.ghost_states.get(name, 0)
            if is_match:
                if saved_state == 1:
                    btn.configure(bg=self.tc('select_bg'), fg=self.tc('select_fg'))
                elif saved_state == 2:
                    btn.configure(bg=self.tc('exclude_bg'), fg=self.tc('exclude_fg'))
        
        # 设置列权重使三列均匀分布，并让按钮填满
        for i in range(cols):
            self.ghost_scrollable_frame.columnconfigure(i, weight=1, uniform="col")
        
        # 更新状态
        count_text = f"{matched_count}/{len(self.ghosts)}"
        self.root.title(f"{APP_NAME} {APP_VERSION} ({count_text})")
        status = f"匹配 {count_text} 个鬼魂 | 难度：{self.difficulty}"
        # 噩梦/疯人院：显示已确认证据进度
        if self.difficulty in ('噩梦', '疯人院'):
            slots = self.evidence_slots()
            included = sum(1 for v in self.evidence_vars.values() if v.get() == 1)
            status += f" | 已确认证据 {included}/{slots}"
        if matched_count == 1:
            status += " | ✅ 已锁定"
        self.status_label.config(text=status)
        
        # 候选鉴别建议
        matched_names = [name for name, m in ghost_match.items() if m]
        self.update_candidate_advice(matched_names)
        
        # 如果没有匹配结果，显示提示
        if matched_count == 0:
            self.detail_text.config(state=tk.NORMAL)
            self.detail_text.delete(1.0, tk.END)
            self.detail_text.insert(1.0, "没有找到匹配的鬼魂。\n\n请尝试：\n1. 修改搜索关键词\n2. 减少筛选条件\n3. 点击 [清除筛选] 按钮")
            self.detail_text.config(state=tk.DISABLED)
    
    def on_canvas_resize(self, event):
        """画布大小变化时，调整内部框架宽度"""
        self.ghost_canvas.itemconfig(self.ghost_canvas_window, width=event.width)
    
    def _restore_ghost_btn_bg(self, btn, name):
        if btn.cget('state') == 'disabled':
            return
        state = self.ghost_states.get(name, 0)
        if state == 1:
            btn.configure(bg=self.tc('select_bg'), fg=self.tc('select_fg'))
        elif state == 2:
            btn.configure(bg=self.tc('exclude_bg'), fg=self.tc('exclude_fg'))
        else:
            btn.configure(bg=self.tc('ghost_bg'), fg=self.tc('text'))
    
    def on_ghost_click(self, ghost):
        """点击鬼魂按钮的回调 - 三态切换"""
        name = ghost["name"]
        current = self.ghost_states.get(name, 0)
        new_state = (current + 1) % 3
        self.ghost_states[name] = new_state
        
        # 更新按钮外观
        if name in self.ghost_btn_refs:
            btn = self.ghost_btn_refs[name]
            if new_state == 1:
                btn.configure(bg=self.tc('select_bg'), fg=self.tc('select_fg'))  # 选中
            elif new_state == 2:
                btn.configure(bg=self.tc('exclude_bg'), fg=self.tc('exclude_fg'))  # 排除
            else:
                btn.configure(bg=self.tc('ghost_bg'), fg=self.tc('text'))  # 未选
        
        # 显示详情
        self.current_ghost = ghost
        self.show_ghost_detail(ghost)
    
    def on_ghost_select(self, event):
        pass
    
    def show_ghost_detail(self, ghost):
        """显示鬼魂详情"""
        self.detail_text.config(state=tk.NORMAL)
        self.detail_text.delete(1.0, tk.END)
        
        # 证据类型映射
        evidence_names = {
            'emf': 'EMF读数5级',
            'box': '通灵盒',
            'uv': '紫外线',
            'orb': '灵球',
            'writing': '鬼魂笔记',
            'freezing': '刺骨寒温',
            'dots': '点阵投影仪'
        }
        
        # 危险等级颜色
        danger_colors = {
            '低': self.tc('danger_low'),
            '中': self.tc('danger_med'),
            '高': self.tc('danger_high'),
            '极高': self.tc('danger_extreme')
        }
        
        # 构建详情文本
        self.detail_text.insert(tk.END, f"【{ghost['name']}】\n\n", 'title')
        
        # 零证据模式提示
        if self.difficulty == '零证据':
            self.detail_text.insert(
                tk.END,
                "（零证据模式：没有可收集的证据，请通过下方行为特征与识别技巧判断）\n\n",
                'highlight')
        
        # 基本信息
        self.detail_text.insert(tk.END, "基本信息:\n", 'header')
        self.detail_text.insert(tk.END, "  危险等级: ", 'normal')
        danger_color = danger_colors.get(ghost.get('danger', ''), self.tc('text'))
        self.detail_text.tag_config('danger', foreground=danger_color)
        self.detail_text.insert(tk.END, f"{ghost.get('danger', '未知')}\n", ('danger',))
        self.detail_text.insert(tk.END, f"  猎杀阈值: {ghost.get('huntThreshold', '未知')}\n", 'normal')
        self.detail_text.insert(tk.END, f"  移动速度: {ghost.get('speed', '未知')}\n", 'normal')
        self.detail_text.insert(tk.END, f"  闪烁频率: {ghost.get('blink', '未知')}\n", 'normal')
        
        # 证据类型
        self.detail_text.insert(tk.END, "证据类型:\n", 'header')
        for ev in ghost['evidence']:
            self.detail_text.insert(tk.END, f"  • {evidence_names.get(ev, ev)}\n", 'normal')
        
        # 噩梦/疯人院难度：强制证据提示
        if self.difficulty in ('噩梦', '疯人院'):
            forced = FORCED_EVIDENCE.get(ghost['name'])
            if forced:
                self.detail_text.insert(
                    tk.END,
                    f"  ⭐ 强制证据（{self.difficulty}难度下必定出现）: {forced}\n",
                    'highlight')
        
        # 描述
        self.detail_text.insert(tk.END, "\n描述:\n", 'header')
        self.detail_text.insert(tk.END, f"{ghost['description']}\n", 'normal')
        
        # 特殊能力
        if ghost.get('ability'):
            self.detail_text.insert(tk.END, "\n特征:\n", 'header')
            self.detail_text.insert(tk.END, f"{ghost['ability']}\n", 'normal')
        
        # 缺点
        if ghost.get('weakness'):
            self.detail_text.insert(tk.END, "\n缺点:\n", 'header')
            self.detail_text.insert(tk.END, f"{ghost['weakness']}\n", 'normal')

        # 特征标签
        traits = ghost.get('traits', [])
        if traits:
            self.detail_text.insert(tk.END, "\n特征标签:\n", 'header')
            for trait in traits:
                self.detail_text.insert(tk.END, f"  • {trait}\n", 'normal')

        # 识别技巧
        if ghost.get('test'):
            self.detail_text.insert(tk.END, "\n识别技巧:\n", 'header')
            self.detail_text.insert(tk.END, f"{ghost['test']}\n", 'normal')
        
        self.detail_text.config(state=tk.DISABLED)
        
        # 滚动到顶部
        self.detail_text.see('1.0')

def main():
    # 检查Python版本
    if sys.version_info < (3, 6):
        messagebox.showerror("错误", "需要Python 3.6或更高版本！")
        return
    
    root = tk.Tk()
    
    # 设置DPI感知（Windows）
    try:
        from ctypes import windll
        windll.shcore.SetProcessDpiAwareness(1)
    except:
        pass
    
    app = GhostViewer(root)
    root.mainloop()

if __name__ == "__main__":
    main()















