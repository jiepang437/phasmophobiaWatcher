# Phasmophobia 鬼魂特征查看器 - 主程序 v2.0
import tkinter as tk
from tkinter import ttk, messagebox
import json
import os
import sys

class GhostViewer:
    def __init__(self, root):
        self.root = root
        self.root.title("恐鬼症鬼魂特征查看器")
        self.root.geometry("450x850")
        self.root.attributes('-topmost', True)  # 始终在最上层
        self.root.attributes('-alpha', 0.95)  # 半透明
        
        # 设置图标（如果存在）
        icon_path = os.path.join(os.path.dirname(__file__), '..', 'assets', 'icon.ico')
        if os.path.exists(icon_path):
            self.root.iconbitmap(icon_path)
        
        # 加载鬼魂数据
        self.ghosts = self.load_ghost_data()
        
        # 当前选中的鬼魂
        self.current_ghost = None
        self.float_mode = False
        
        # 创建界面
        self.create_widgets()
        
        # 绑定快捷键
        self.root.bind('<Escape>', lambda e: self.minimize_to_float())
        self.root.bind('<Control-f>', lambda e: self.search_entry.focus_set())
        
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
        float_label = tk.Label(float_frame, text="👻", font=('Arial', 20), 
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
        
        # 尝试多个可能的路径
        possible_paths = [
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
                        print(f"成功加载数据文件: {abs_path}")
                        print(f"鬼魂数量: {len(data)}")
                        return data
                except json.JSONDecodeError as e:
                    print(f"错误: JSON解析失败 - {abs_path}: {e}")
                    continue
        
        # 如果找不到文件，显示错误
        error_msg = f"找不到鬼魂数据文件！\n\n已尝试以下路径:\n"
        for path in possible_paths:
            error_msg += f"- {os.path.abspath(path)}\n"
        
        messagebox.showerror("错误", error_msg)
        return []

    def create_widgets(self):
        """创建界面组件"""
        # 自定义样式
        style = ttk.Style()
        style.configure('Title.TLabel', font=('微软雅黑', 12, 'bold'))
        style.configure('Header.TLabel', font=('微软雅黑', 10, 'bold'))
        style.configure('Detail.TLabel', font=('微软雅黑', 9))
        
        # 主框架
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # 标题栏（可拖动区域）
        title_frame = ttk.Frame(main_frame)
        title_frame.pack(fill=tk.X, pady=(0, 10))
        
        title_label = ttk.Label(title_frame, text="👻 恐鬼症鬼魂特征查看器", style='Title.TLabel')
        title_label.pack(side=tk.LEFT)
        
        # 最小化和关闭按钮
        btn_frame = ttk.Frame(title_frame)
        btn_frame.pack(side=tk.RIGHT)
        
        minimize_btn = ttk.Button(btn_frame, text="—", width=3, 
                                 command=self.minimize_to_float)
        minimize_btn.pack(side=tk.LEFT, padx=2)
        
        close_btn = ttk.Button(btn_frame, text="✕", width=3, 
                              command=self.root.destroy)
        close_btn.pack(side=tk.LEFT, padx=2)
        
        # 搜索框
        search_frame = ttk.LabelFrame(main_frame, text="🔍 搜索鬼魂", padding="5")
        search_frame.pack(fill=tk.X, pady=(0, 10))
        
        self.search_var = tk.StringVar()
        self.search_var.trace('w', self.on_search_change)
        self.search_entry = ttk.Entry(search_frame, textvariable=self.search_var)
        self.search_entry.pack(fill=tk.X)
        self.search_entry.bind('<Return>', lambda e: self.search_entry.selection_clear())
        
        # 证据筛选
        filter_frame = ttk.LabelFrame(main_frame, text="📋 按证据筛选", padding="5")
        filter_frame.pack(fill=tk.X, pady=(0, 10))
        
        # 证据复选框
        self.evidence_vars = {}
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
            var = tk.BooleanVar()
            self.evidence_vars[ev_id] = var
            cb = ttk.Checkbutton(filter_frame, text=ev_name, variable=var, 
                                command=self.on_filter_change)
            cb.grid(row=i//4, column=i%4, sticky=tk.W, padx=5, pady=2)
        
        # 清除筛选按钮
        clear_btn = ttk.Button(filter_frame, text="清除筛选", 
                              command=self.clear_filters)
        clear_btn.grid(row=2, column=0, columnspan=4, pady=(5, 0))
        
        # 鬼魂列表
        list_frame = ttk.LabelFrame(main_frame, text="👻 鬼魂列表", padding="5")
        list_frame.pack(fill=tk.BOTH, expand=True)
        
        # 列表框和滚动条
        list_container = ttk.Frame(list_frame)
        list_container.pack(fill=tk.BOTH, expand=True)
        
        scrollbar = ttk.Scrollbar(list_container)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.ghost_listbox = tk.Listbox(list_container, yscrollcommand=scrollbar.set,
                                       font=('微软雅黑', 10), selectmode=tk.SINGLE)
        self.ghost_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.config(command=self.ghost_listbox.yview)
        
        # 绑定选择事件
        self.ghost_listbox.bind('<<ListboxSelect>>', self.on_ghost_select)
        
        # 详情显示区域
        detail_frame = ttk.LabelFrame(main_frame, text="📖 鬼魂详情", padding="5")
        detail_frame.pack(fill=tk.X, pady=(10, 0))
        
        # 详情文本框和滚动条
        detail_container = ttk.Frame(detail_frame)
        detail_container.pack(fill=tk.X)
        
        detail_scrollbar = ttk.Scrollbar(detail_container)
        detail_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.detail_text = tk.Text(detail_container, height=20, wrap=tk.WORD, 
                                  font=('微软雅黑', 9), yscrollcommand=detail_scrollbar.set)
        self.detail_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        detail_scrollbar.config(command=self.detail_text.yview)
        
        self.detail_text.config(state=tk.DISABLED)
        
        # 配置文本标签
        self.detail_text.tag_configure('title', font=('微软雅黑', 11, 'bold'))
        self.detail_text.tag_configure('header', font=('微软雅黑', 9, 'bold'))
        self.detail_text.tag_configure('normal', font=('微软雅黑', 9))
        self.detail_text.tag_configure('highlight', foreground='blue')
        
        # 状态栏
        status_frame = ttk.Frame(main_frame)
        status_frame.pack(fill=tk.X, pady=(5, 0))
        
        self.status_label = ttk.Label(status_frame, text="就绪", font=('微软雅黑', 8))
        self.status_label.pack(side=tk.LEFT)
        
        # 快捷键提示
        shortcut_label = ttk.Label(status_frame, text="Ctrl+F: 搜索 | Esc: 退出", 
                                  font=('微软雅黑', 8))
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
        for var in self.evidence_vars.values():
            var.set(False)
        self.update_ghost_list()
    
    def update_ghost_list(self):
        """更新鬼魂列表显示"""
        self.ghost_listbox.delete(0, tk.END)
        
        # 获取筛选条件
        search_text = self.search_var.get().lower()
        selected_evidence = [ev_id for ev_id, var in self.evidence_vars.items() if var.get()]
        
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
        
        # 筛选鬼魂
        filtered_ghosts = []
        for ghost in self.ghosts:
            # 搜索筛选
            if search_text and search_text not in ghost['name'].lower():
                continue
            
            # 证据筛选
            if selected_evidence:
                # 将英文证据ID转换为中文证据名称
                selected_evidence_names = [evidence_names.get(ev, ev) for ev in selected_evidence]
                if not all(ev in ghost['evidence'] for ev in selected_evidence_names):
                    continue
            
            filtered_ghosts.append(ghost)
        
        # 添加到列表
        for ghost in filtered_ghosts:
            self.ghost_listbox.insert(tk.END, ghost['name'])
        
        # 更新状态
        count_text = f"{len(filtered_ghosts)}/{len(self.ghosts)}"
        self.root.title(f"恐鬼症鬼魂特征查看器 ({count_text})")
        self.status_label.config(text=f"显示 {count_text} 个鬼魂")
        
        # 如果没有结果，显示提示
        if not filtered_ghosts:
            self.detail_text.config(state=tk.NORMAL)
            self.detail_text.delete(1.0, tk.END)
            self.detail_text.insert(1.0, "没有找到匹配的鬼魂。\n\n请尝试：\n1. 修改搜索关键词\n2. 减少筛选条件\n3. 点击 [清除筛选] 按钮")
            self.detail_text.config(state=tk.DISABLED)
    def on_ghost_select(self, event):
        """鬼魂选择事件"""
        selection = self.ghost_listbox.curselection()
        if not selection:
            return
        
        index = selection[0]
        ghost_name = self.ghost_listbox.get(index)
        
        # 查找对应的鬼魂数据
        for ghost in self.ghosts:
            if ghost['name'] == ghost_name:
                self.current_ghost = ghost
                self.show_ghost_detail(ghost)
                break
    
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
            'Low': 'green',
            'Med': 'orange',
            'High': 'red'
        }
        
        # 构建详情文本
        # self.detail_text.insert(tk.END, f"【{ghost['name']}】\n\n", 'title')
        
        # # 基本信息
        # self.detail_text.insert(tk.END, "基本信息:\n", 'header')
        # self.detail_text.insert(tk.END, f"  危险等级: ", 'normal')
        # danger_color = danger_colors.get(ghost['danger'], 'black')
        # self.detail_text.insert(tk.END, f"{ghost['danger']}\n", ('highlight',))
        
        # self.detail_text.insert(tk.END, f"  猎杀阈值: {ghost['huntThreshold']}\n", 'normal')
        # self.detail_text.insert(tk.END, f"  移动速度: {ghost['speed']}\n", 'normal')
        # self.detail_text.insert(tk.END, f"  闪烁频率: {ghost['blink']}\n\n", 'normal')
        
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
        
        # 特征
        if ghost.get('test'):
            self.detail_text.insert(tk.END, "\n缺点:\n", 'header')
            self.detail_text.insert(tk.END, f"{ghost['test']}\n", 'normal')

         # 社区总结
        # if ghost['traits']:
        #     self.detail_text.insert(tk.END, "\n社区总结:\n", 'header')
        #     for trait in ghost['traits']:
        #         self.detail_text.insert(tk.END, f"  • {trait}\n", 'normal')
                

        
        self.detail_text.config(state=tk.DISABLED)
        
        # 滚动到顶部
        self.detail_text.see(tk.END)

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















