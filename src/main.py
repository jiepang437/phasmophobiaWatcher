# Phasmophobia 鬼魂特征查看器 - 主程序 v2.0
import os
import sys

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
        
        # 使窗口可拖动
        self.root.bind('<Button-1>', self.start_move)
        self.root.bind('<B1-Motion>', self.on_move)
    
    def minimize_to_float(self):
        """缩小到50x50悬浮窗"""
        # 保存当前窗口位置和大小
        self.original_geometry = self.root.geometry()
        
        # 设置新大小和位置（50x50，在左上角）
        new_x = 10
        new_y = 10
        
        # 隐藏所有组件
        for widget in self.root.winfo_children():
            widget.pack_forget()
        
        # 设置窗口大小
        self.root.geometry(f"50x50+{new_x}+{new_y}")
        self.root.overrideredirect(True)  # 移除窗口边框
        
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
        
        self.float_mode = True
    
    def restore_from_float(self):
        """从悬浮窗恢复"""
        if hasattr(self, 'original_geometry'):
            # 恢复窗口边框
            self.root.overrideredirect(False)
            
            # 恢复原始大小
            self.root.geometry(self.original_geometry)
            
            # 删除悬浮窗组件
            for widget in self.root.winfo_children():
                widget.destroy()
            
            # 重新创建界面
            self.create_widgets()
            self.update_ghost_list()
            
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
        """销毁并重建整个界面"""
        for widget in self.root.winfo_children():
            widget.destroy()
        self.create_widgets()
        self.update_ghost_list()

    def focus_search(self, event=None):
        """Ctrl+F：聚焦搜索框"""
        self.search_entry.focus_set()

    def create_widgets(self):
        """创建界面组件 - 横向三栏布局"""
        # 自定义样式
        style = ttk.Style()
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
        
        title_label = ttk.Label(title_frame, text="👻 恐鬼症鬼魂特征查看器", style='Title.TLabel')
        title_label.pack(side=tk.LEFT)
        
        # 背景色说明
        legend_frame = ttk.Frame(main_frame)
        legend_frame.pack(fill=tk.X, pady=(0, 5))
        
        legend_items = [
            ('  ', '#f0f0f0', '未选中'),
            ('  ', '#90EE90', '选中'),
            ('  ', '#FFB6C1', '排除'),
            ('  ', '#a0a0a0', '不匹配'),
        ]
        
        for color, bg, label in legend_items:
            swatch = tk.Label(legend_frame, text='  ', bg=bg, relief=tk.SUNKEN, width=2)
            swatch.pack(side=tk.LEFT, padx=(5, 2))
            txt = ttk.Label(legend_frame, text=label, font=('微软雅黑', self.fs(8)))
            txt.pack(side=tk.LEFT, padx=(0, 10))
        
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
        
        self.search_var = tk.StringVar()
        self.search_var.trace('w', self.on_search_change)
        self.search_entry = ttk.Entry(search_frame, textvariable=self.search_var)
        self.search_entry.pack(fill=tk.X)
        self.search_entry.bind('<Return>', lambda e: self.search_entry.selection_clear())
        
        # ===== 横向三栏容器 =====
        columns_frame = ttk.Frame(main_frame)
        columns_frame.pack(fill=tk.BOTH, expand=True)
        
        # 第一栏：证据筛选（左侧，纵向排列）
        evidence_frame = ttk.LabelFrame(columns_frame, text="📋 证据筛选", padding="5")
        evidence_frame.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 10))
        
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
                         padx=8, pady=4, cursor='hand2', bg='#f0f0f0',
                         font=('Microsoft YaHei', self.fs(10)))
            cb.bind('<Button-1>', lambda e, eid=ev_id: self.cycle_evidence(eid))
            cb.pack(fill=tk.X, pady=2)
            self.evidence_cbs[ev_id] = cb
        
        # 清除筛选按钮
        clear_btn = ttk.Button(evidence_frame, text="清除筛选", 
                              style='App.TButton', command=self.clear_filters)
        clear_btn.pack(fill=tk.X, pady=(10, 0))
        
        # 第二栏：鬼魂列表（中间，纵向滚动列表）
        list_frame = ttk.LabelFrame(columns_frame, text="👻 鬼魂列表", padding="5")
        list_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 10))
        
        self.ghost_grid_frame = tk.Frame(list_frame)
        self.ghost_grid_frame.pack(fill=tk.BOTH, expand=True)
        
        # 滚动条
        self.ghost_canvas = tk.Canvas(self.ghost_grid_frame)
        self.ghost_scrollbar = ttk.Scrollbar(self.ghost_grid_frame, orient=tk.VERTICAL, command=self.ghost_canvas.yview)
        self.ghost_scrollable_frame = tk.Frame(self.ghost_canvas)
        
        self.ghost_scrollable_frame.bind(
            "<Configure>",
            lambda e: self.ghost_canvas.configure(scrollregion=self.ghost_canvas.bbox("all"))
        )
        
        self.ghost_canvas_window = self.ghost_canvas.create_window((0, 0), window=self.ghost_scrollable_frame, anchor="nw")
        self.ghost_canvas.configure(yscrollcommand=self.ghost_scrollbar.set)
        
        self.ghost_canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        self.ghost_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # 鬼魂按钮列表
        self.ghost_buttons = []
        self.ghost_names = []
        
        # 绑定鼠标滚轮
        self.ghost_canvas.bind("<MouseWheel>", lambda e: self.ghost_canvas.yview_scroll(-1*(e.delta//120), "units"))
        self.ghost_scrollable_frame.bind("<MouseWheel>", lambda e: self.ghost_canvas.yview_scroll(-1*(e.delta//120), "units"))
        
        # 第三栏：鬼魂详情（右侧，纵向填充）
        detail_frame = ttk.LabelFrame(columns_frame, text="📖 鬼魂详情", padding="5")
        detail_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        # 详情文本框和滚动条
        detail_container = ttk.Frame(detail_frame)
        detail_container.pack(fill=tk.BOTH, expand=True)
        
        detail_scrollbar = ttk.Scrollbar(detail_container)
        detail_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.detail_text = tk.Text(detail_container, wrap=tk.WORD, 
                                  font=('微软雅黑', self.dfs(9)), yscrollcommand=detail_scrollbar.set)
        self.detail_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        detail_scrollbar.config(command=self.detail_text.yview)
        
        self.detail_text.config(state=tk.DISABLED)
        
        # 配置文本标签
        self.detail_text.tag_configure('title', font=('微软雅黑', self.dfs(11), 'bold'))
        self.detail_text.tag_configure('header', font=('微软雅黑', self.dfs(9), 'bold'))
        self.detail_text.tag_configure('normal', font=('微软雅黑', self.dfs(9)))
        self.detail_text.tag_configure('highlight', foreground='blue')
        
        # 状态栏
        status_frame = ttk.Frame(main_frame)
        status_frame.pack(fill=tk.X, pady=(5, 0))
        
        self.status_label = ttk.Label(status_frame, text="就绪", font=('微软雅黑', self.fs(8)))
        self.status_label.pack(side=tk.LEFT)
        
        # 快捷键提示
        shortcut_label = ttk.Label(status_frame, text="Ctrl+F: 搜索 | Esc: 退出", 
                                  font=('微软雅黑', self.fs(8)))
        shortcut_label.pack(side=tk.RIGHT)
    
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
        var = self.evidence_vars[ev_id]
        current = var.get()
        var.set((current + 1) % 3)
        self.update_evidence_display(ev_id)
        self.update_ghost_list()
    
    def update_evidence_display(self, ev_id):
        """更新证据按钮的显示状态 - 只改变背景色，不改变文字"""
        var = self.evidence_vars[ev_id]
        cb = self.evidence_cbs[ev_id]
        state = var.get()
        if state == 1:
            cb.configure(bg='#90EE90')  # 绿色 = 包含
        elif state == 2:
            cb.configure(bg='#FFB6C1')  # 粉色 = 排除
        else:
            cb.configure(bg='#f0f0f0')  # 灰色 = 未选
    
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
        
        # 判断每个鬼魂是否匹配
        ghost_match = {}
        matched_count = 0
        for ghost in self.ghosts:
            name = ghost['name']
            is_match = True
            
            # 搜索筛选
            if search_text and search_text not in name.lower():
                is_match = False
            
            # 证据包含筛选
            if is_match and include_evidence:
                if not all(ev in ghost['evidence'] for ev in include_evidence):
                    is_match = False
            
            # 证据排除筛选
            if is_match and exclude_evidence:
                if any(ev in ghost['evidence'] for ev in exclude_evidence):
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
                              bg='#f0f0f0', fg='black',
                              activebackground='#e0e0e0', activeforeground='black')
                btn.bind('<Enter>', lambda e, b=btn: b.configure(bg='#d0d0d0') if b.cget('state') == 'normal' else None)
                btn.bind('<Leave>', lambda e, b=btn, n=name: self._restore_ghost_btn_bg(b, n))
            else:
                # 不匹配的鬼魂：变暗，禁用
                btn = tk.Button(self.ghost_scrollable_frame, text=name,
                              state=tk.DISABLED,
                              relief=tk.FLAT, padx=8, pady=4,
                              font=('Microsoft YaHei', self.fs(10)),
                              bg='#a0a0a0', fg='#666666',
                              disabledforeground='#666666')
            
            btn.grid(row=row, column=col, padx=3, pady=2, sticky='ew')
            self.ghost_buttons.append(btn)
            self.ghost_names.append(name)
            self.ghost_btn_refs[name] = btn
            
            # 应用已保存的选择状态
            saved_state = self.ghost_states.get(name, 0)
            if is_match:
                if saved_state == 1:
                    btn.configure(bg="#90EE90")
                elif saved_state == 2:
                    btn.configure(bg="#FFB6C1")
        
        # 设置列权重使三列均匀分布，并让按钮填满
        for i in range(cols):
            self.ghost_scrollable_frame.columnconfigure(i, weight=1, uniform="col")
        
        # 更新状态
        count_text = f"{matched_count}/{len(self.ghosts)}"
        self.root.title(f"恐鬼症鬼魂特征查看器 ({count_text})")
        self.status_label.config(text=f"匹配 {count_text} 个鬼魂")
        
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
            btn.configure(bg='#90EE90')
        elif state == 2:
            btn.configure(bg='#FFB6C1')
        else:
            btn.configure(bg='#f0f0f0')
    
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
                btn.configure(bg="#90EE90")  # 绿色 = 选中
            elif new_state == 2:
                btn.configure(bg="#FFB6C1")  # 粉色 = 排除
            else:
                btn.configure(bg="#f0f0f0")  # 灰色 = 未选
        
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
            '低': 'green',
            '中': 'orange',
            '高': 'red',
            '极高': '#8B0000'
        }
        
        # 构建详情文本
        self.detail_text.insert(tk.END, f"【{ghost['name']}】\n\n", 'title')
        
        # 基本信息
        self.detail_text.insert(tk.END, "基本信息:\n", 'header')
        self.detail_text.insert(tk.END, "  危险等级: ", 'normal')
        danger_color = danger_colors.get(ghost.get('danger', ''), 'black')
        self.detail_text.tag_config('danger', foreground=danger_color)
        self.detail_text.insert(tk.END, f"{ghost.get('danger', '未知')}\n", ('danger',))
        self.detail_text.insert(tk.END, f"  猎杀阈值: {ghost.get('huntThreshold', '未知')}\n", 'normal')
        self.detail_text.insert(tk.END, f"  移动速度: {ghost.get('speed', '未知')}\n", 'normal')
        self.detail_text.insert(tk.END, f"  闪烁频率: {ghost.get('blink', '未知')}\n", 'normal')
        
        # 证据类型
        self.detail_text.insert(tk.END, "证据类型:\n", 'header')
        for ev in ghost['evidence']:
            self.detail_text.insert(tk.END, f"  • {evidence_names.get(ev, ev)}\n", 'normal')
        
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















